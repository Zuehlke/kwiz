package ch.zuhlke.camp.kwiz.application;

import ch.zuhlke.camp.kwiz.controller.WebSocketController;
import ch.zuhlke.camp.kwiz.domain.Game;
import ch.zuhlke.camp.kwiz.domain.GameEngine;
import ch.zuhlke.camp.kwiz.domain.GameStatus;
import ch.zuhlke.camp.kwiz.domain.Question;
import ch.zuhlke.camp.kwiz.domain.Quiz;
import ch.zuhlke.camp.kwiz.domain.Round;
import ch.zuhlke.camp.kwiz.events.TimerElapsedEvent;
import ch.zuhlke.camp.kwiz.infrastructure.GameTimerScheduler;
import ch.zuhlke.camp.kwiz.infrastructure.InMemoryGameRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

/**
 * GameOrchestrationService is an application service that orchestrates the game lifecycle
 * and interactions. It handles commands and queries related to game creation, player
 * interactions, and admin controls.
 */
@Service
public class GameOrchestrationService {
    private final InMemoryGameRepository gameRepository;
    private final WebSocketController webSocketController;
    private final GameTimerScheduler gameTimerScheduler;
    private final GameEngine gameEngine;

    public GameOrchestrationService(InMemoryGameRepository gameRepository, 
                                   WebSocketController webSocketController,
                                   GameTimerScheduler gameTimerScheduler,
                                   GameEngine gameEngine) {
        this.gameRepository = gameRepository;
        this.webSocketController = webSocketController;
        this.gameTimerScheduler = gameTimerScheduler;
        this.gameEngine = gameEngine;
    }

    /**
     * Creates and starts a new game based on a quiz definition.
     *
     * @param quizDefinitionId the ID of the quiz definition to base the game on
     * @param adminId the ID of the admin who will control the game
     * @return the ID of the created game
     * @throws IllegalArgumentException if the quiz definition is invalid or not found
     */
    public String createAndStartGame(String quizDefinitionId, String adminId) {
        Quiz quiz = gameEngine.getQuizById(quizDefinitionId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizDefinitionId);
        }

        // Create a new game
        Game game = new Game(quizDefinitionId, adminId);

        // Add existing players from the quiz to the game
        for (var player : quiz.getPlayers()) {
            game.addPlayer(player.getId(), player.getName());
        }

        // Start the game with the rounds from the quiz
        game.startGame(quiz.getRounds());

        // Save the game
        gameRepository.save(game);

        // Register the game with the timer scheduler
        gameTimerScheduler.registerGame(game.getId());

        // Broadcast the initial game state
        broadcastGameState(game);

        return game.getId();
    }

    /**
     * Submits a player's answer for a question in a game.
     *
     * @param gameId the ID of the game
     * @param playerId the ID of the player submitting the answer
     * @param questionId the ID of the question being answered
     * @param answerText the text of the answer
     * @throws IllegalArgumentException if the game, player, or question does not exist
     * @throws IllegalStateException if the game is not accepting answers
     */
    public void submitPlayerAnswer(String gameId, String playerId, String questionId, String answerText) {
        Game game = getGameById(gameId);

        try {
            // Attempt to record the player's answer
            game.acceptPlayerAnswer(playerId, questionId, answerText);

            // Save the updated game state
            gameRepository.save(game);

            // Broadcast the updated game state
            broadcastGameState(game);

            // Send a confirmation to the player
            webSocketController.sendPlayerAnswerConfirmation(gameId, playerId, questionId);
        } catch (IllegalArgumentException | IllegalStateException e) {
            // Send an error message to the player
            webSocketController.sendPlayerAnswerError(gameId, playerId, questionId, e.getMessage());
            throw e; // Re-throw the exception for the caller to handle
        }
    }

    /**
     * Allows an admin to manually close the current question.
     *
     * @param gameId the ID of the game
     * @param adminId the ID of the admin
     * @throws IllegalArgumentException if the game does not exist or the adminId is invalid
     * @throws IllegalStateException if the game is not in the QUESTION_ACTIVE status
     */
    public void adminCloseCurrentQuestion(String gameId, String adminId) {
        Game game = getGameById(gameId);

        game.adminCloseCurrentQuestion(adminId);
        gameRepository.save(game);

        // Unregister the game from the scheduler as the question is now closed
        gameTimerScheduler.unregisterGame(gameId);

        broadcastGameState(game);
    }

    /**
     * Allows an admin to proceed to the next question or round.
     *
     * @param gameId the ID of the game
     * @param adminId the ID of the admin
     * @throws IllegalArgumentException if the game does not exist or the adminId is invalid
     * @throws IllegalStateException if the game is not in the QUESTION_CLOSED status
     */
    public void adminAdvanceToNextQuestion(String gameId, String adminId) {
        Game game = getGameById(gameId);

        game.adminProceedToNextQuestion(adminId);
        gameRepository.save(game);

        // If the game has moved to a new question (QUESTION_ACTIVE), register it with the scheduler
        if (game.getStatus() == GameStatus.QUESTION_ACTIVE) {
            gameTimerScheduler.registerGame(gameId);
        } else if (game.getStatus() == GameStatus.GAME_OVER) {
            // If the game is over, unregister it from the scheduler
            gameTimerScheduler.unregisterGame(gameId);
        }

        broadcastGameState(game);
    }

    /**
     * Allows an admin to start the next round after a round has been completed.
     *
     * @param gameId the ID of the game
     * @param adminId the ID of the admin
     * @throws IllegalArgumentException if the game does not exist or the adminId is invalid
     * @throws IllegalStateException if the game is not in the ROUND_COMPLETED status
     */
    public void adminStartNextRound(String gameId, String adminId) {
        Game game = getGameById(gameId);

        game.adminStartNextRound(adminId);
        gameRepository.save(game);

        // Register the game with the scheduler as a new question is now active
        gameTimerScheduler.registerGame(gameId);

        broadcastGameState(game);
    }

    /**
     * Handles a timer elapsed event.
     *
     * @param event the timer elapsed event
     */
    @EventListener
    public void handleTimerElapsed(TimerElapsedEvent event) {
        handleGameTick(event.getGameId());
    }

    /**
     * Handles a game tick, decrementing the question timer and updating the game state if necessary.
     * This method is called when a timer elapsed event is received.
     *
     * @param gameId the ID of the game
     */
    public void handleGameTick(String gameId) {
        Game game = getGameById(gameId);

        // Only process ticks for active games with active questions
        if (game.getStatus() == GameStatus.QUESTION_ACTIVE) {
            // Get the current timer value before decrementing
            int previousTimerValue = game.getCurrentQuestionRemainingSeconds();

            // Decrement the timer
            game.decrementQuestionTimer();

            // Save the updated game state
            gameRepository.save(game);

            // Check if the timer reached zero or if we should broadcast an update
            if (game.getCurrentQuestionRemainingSeconds() == 0 || 
                game.getCurrentQuestionRemainingSeconds() % 1 == 0) { // Broadcast every second
                broadcastGameState(game);
            }
        }
    }

    /**
     * Returns a snapshot of the current game state, suitable for sending to clients.
     *
     * @param gameId the ID of the game
     * @return a GameStateDTO representing the current state of the game
     * @throws IllegalArgumentException if the game does not exist
     */
    public GameStateDTO getGameSnapshot(String gameId) {
        Game game = getGameById(gameId);
        return createGameStateDTO(game);
    }

    /**
     * Returns a game by its ID.
     *
     * @param gameId the ID of the game
     * @return the game
     * @throws IllegalArgumentException if the game does not exist
     */
    private Game getGameById(String gameId) {
        return gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("No game found with ID: " + gameId));
    }

    /**
     * Broadcasts the current game state to all connected clients.
     *
     * @param game the game whose state to broadcast
     */
    private void broadcastGameState(Game game) {
        GameStateDTO gameState = createGameStateDTO(game);
        webSocketController.broadcastGameState(game.getId(), gameState);
    }

    /**
     * Creates a DTO representing the current state of a game.
     *
     * @param game the game
     * @return a GameStateDTO
     */
    private GameStateDTO createGameStateDTO(Game game) {
        Question currentQuestion = game.getCurrentQuestion();
        Round currentRound = game.getCurrentRound();

        return new GameStateDTO(
                game.getId(),
                game.getQuizDefinitionId(),
                game.getStatus(),
                currentRound != null ? currentRound.getId() : null,
                currentRound != null ? currentRound.getName() : null,
                currentQuestion != null ? currentQuestion.getId() : null,
                currentQuestion != null ? currentQuestion.getText() : null,
                game.getCurrentQuestionRemainingSeconds(),
                game.isAcceptingAnswers(),
                game.getPlayers().values().stream()
                        .map(player -> new PlayerDTO(player.getPlayerId(), player.getDisplayName(), player.getScore()))
                        .collect(Collectors.toList())
        );
    }

    /**
     * DTO for transferring game state information to clients.
     */
    public static class GameStateDTO {
        private final String gameId;
        private final String quizDefinitionId;
        private final GameStatus status;
        private final String currentRoundId;
        private final String currentRoundName;
        private final String currentQuestionId;
        private final String currentQuestionText;
        private final int remainingSeconds;
        private final boolean acceptingAnswers;
        private final List<PlayerDTO> players;

        public GameStateDTO(String gameId, String quizDefinitionId, GameStatus status,
                           String currentRoundId, String currentRoundName,
                           String currentQuestionId, String currentQuestionText,
                           int remainingSeconds, boolean acceptingAnswers,
                           List<PlayerDTO> players) {
            this.gameId = gameId;
            this.quizDefinitionId = quizDefinitionId;
            this.status = status;
            this.currentRoundId = currentRoundId;
            this.currentRoundName = currentRoundName;
            this.currentQuestionId = currentQuestionId;
            this.currentQuestionText = currentQuestionText;
            this.remainingSeconds = remainingSeconds;
            this.acceptingAnswers = acceptingAnswers;
            this.players = players;
        }

        public String getGameId() {
            return gameId;
        }

        public String getQuizDefinitionId() {
            return quizDefinitionId;
        }

        public GameStatus getStatus() {
            return status;
        }

        public String getCurrentRoundId() {
            return currentRoundId;
        }

        public String getCurrentRoundName() {
            return currentRoundName;
        }

        public String getCurrentQuestionId() {
            return currentQuestionId;
        }

        public String getCurrentQuestionText() {
            return currentQuestionText;
        }

        public int getRemainingSeconds() {
            return remainingSeconds;
        }

        public boolean isAcceptingAnswers() {
            return acceptingAnswers;
        }

        public List<PlayerDTO> getPlayers() {
            return players;
        }
    }

    /**
     * DTO for transferring player information to clients.
     */
    public static class PlayerDTO {
        private final String playerId;
        private final String displayName;
        private final int score;

        public PlayerDTO(String playerId, String displayName, int score) {
            this.playerId = playerId;
            this.displayName = displayName;
            this.score = score;
        }

        public String getPlayerId() {
            return playerId;
        }

        public String getDisplayName() {
            return displayName;
        }

        public int getScore() {
            return score;
        }
    }
}
