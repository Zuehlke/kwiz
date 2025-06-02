package ch.zuhlke.camp.kwiz.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Game is an aggregate root that represents a running instance of a quiz.
 * It manages the game flow and state, including the current round, current question,
 * timer, player submissions, and game status.
 */
public class Game {
    private final String id;
    private final String quizDefinitionId;
    private final Map<String, PlayerInGame> players;
    private final List<Round> rounds;
    private final List<PlayerSubmission> playerSubmissions;
    private final String adminId;

    private int currentRoundIndex;
    private int currentQuestionIndex;
    private int currentQuestionRemainingSeconds;
    private boolean isAcceptingAnswers;
    private GameStatus status;
    private long currentQuestionStartTime;

    /**
     * Creates a new Game instance based on a quiz definition.
     *
     * @param quizDefinitionId the ID of the Quiz template/setup this game is based on
     * @param adminId the ID of the admin who controls this game
     */
    public Game(String quizDefinitionId, String adminId) {
        this.id = UUID.randomUUID().toString();
        this.quizDefinitionId = quizDefinitionId;
        this.players = new HashMap<>();
        this.rounds = new ArrayList<>();
        this.playerSubmissions = new ArrayList<>();
        this.adminId = adminId;
        this.currentRoundIndex = 0;
        this.currentQuestionIndex = 0;
        this.currentQuestionRemainingSeconds = 0;
        this.isAcceptingAnswers = false;
        this.status = GameStatus.LOBBY;
    }

    /**
     * Returns the ID of this game.
     *
     * @return the game ID
     */
    public String getId() {
        return id;
    }

    /**
     * Returns the ID of the quiz definition this game is based on.
     *
     * @return the quiz definition ID
     */
    public String getQuizDefinitionId() {
        return quizDefinitionId;
    }

    /**
     * Returns an unmodifiable map of players in this game.
     *
     * @return the players map
     */
    public Map<String, PlayerInGame> getPlayers() {
        return Collections.unmodifiableMap(players);
    }

    /**
     * Returns an unmodifiable list of rounds in this game.
     *
     * @return the rounds list
     */
    public List<Round> getRounds() {
        return Collections.unmodifiableList(rounds);
    }

    /**
     * Returns an unmodifiable list of player submissions in this game.
     *
     * @return the player submissions list
     */
    public List<PlayerSubmission> getPlayerSubmissions() {
        return Collections.unmodifiableList(playerSubmissions);
    }

    /**
     * Returns the ID of the admin who controls this game.
     *
     * @return the admin ID
     */
    public String getAdminId() {
        return adminId;
    }

    /**
     * Returns the index of the current round.
     *
     * @return the current round index
     */
    public int getCurrentRoundIndex() {
        return currentRoundIndex;
    }

    /**
     * Returns the index of the current question.
     *
     * @return the current question index
     */
    public int getCurrentQuestionIndex() {
        return currentQuestionIndex;
    }

    /**
     * Returns the remaining seconds for the current question.
     *
     * @return the remaining seconds
     */
    public int getCurrentQuestionRemainingSeconds() {
        return currentQuestionRemainingSeconds;
    }

    /**
     * Returns the timestamp when the current question started.
     *
     * @return the start time in milliseconds since epoch
     */
    public long getCurrentQuestionStartTime() {
        return currentQuestionStartTime;
    }

    /**
     * Returns whether the game is currently accepting answers.
     *
     * @return true if the game is accepting answers, false otherwise
     */
    public boolean isAcceptingAnswers() {
        return isAcceptingAnswers;
    }

    /**
     * Returns the current status of the game.
     *
     * @return the game status
     */
    public GameStatus getStatus() {
        return status;
    }

    /**
     * Returns the current round.
     *
     * @return the current round, or null if there are no rounds
     */
    public Round getCurrentRound() {
        if (rounds.isEmpty()) {
            return null;
        }
        return rounds.get(currentRoundIndex);
    }

    /**
     * Returns the current question.
     *
     * @return the current question, or null if there is no current question
     */
    public Question getCurrentQuestion() {
        Round currentRound = getCurrentRound();
        if (currentRound == null || currentRound.getQuestions().isEmpty() || 
            currentQuestionIndex >= currentRound.getQuestions().size()) {
            return null;
        }
        return currentRound.getQuestions().get(currentQuestionIndex);
    }

    /**
     * Adds a player to the game.
     *
     * @param playerId the ID of the player
     * @param displayName the display name of the player
     * @throws IllegalStateException if the game is not in the LOBBY status
     */
    public void addPlayer(String playerId, String displayName) {
        if (status != GameStatus.LOBBY) {
            throw new IllegalStateException("Cannot add player after game has started");
        }

        if (players.containsKey(playerId)) {
            throw new IllegalArgumentException("Player with ID " + playerId + " already exists in this game");
        }

        players.put(playerId, new PlayerInGame(playerId, displayName));
    }

    /**
     * Starts the game with the provided rounds.
     *
     * @param gameRounds the rounds for this game
     * @throws IllegalStateException if the game is not in the LOBBY status or if there are no rounds
     */
    public void startGame(List<Round> gameRounds) {
        if (status != GameStatus.LOBBY) {
            throw new IllegalStateException("Game has already started");
        }

        if (gameRounds == null || gameRounds.isEmpty()) {
            throw new IllegalStateException("Cannot start game without rounds");
        }

        if (players.isEmpty()) {
            throw new IllegalStateException("Cannot start game without players");
        }

        this.rounds.clear();
        this.rounds.addAll(gameRounds);

        // Set up the first round and question
        currentRoundIndex = 0;
        currentQuestionIndex = 0;

        // Start the first question
        startCurrentQuestion();
    }

    /**
     * Sets up the current question, resets the timer, and starts accepting answers.
     *
     * @throws IllegalStateException if there is no current question
     */
    public void startCurrentQuestion() {
        Question currentQuestion = getCurrentQuestion();
        if (currentQuestion == null) {
            throw new IllegalStateException("No current question available");
        }

        // Set the timer based on the question's time limit
        currentQuestionRemainingSeconds = currentQuestion.getTimeLimit();

        // Start accepting answers
        isAcceptingAnswers = true;

        // Update the game status
        status = GameStatus.QUESTION_ACTIVE;

        // Record the question start time
        currentQuestionStartTime = System.currentTimeMillis();

        // Activate the current round if it's not already active
        Round currentRound = getCurrentRound();
        if (!currentRound.isActive()) {
            currentRound.activate();
        }
    }

    /**
     * Accepts a player's answer for the current question.
     *
     * @param playerId the ID of the player submitting the answer
     * @param questionId the ID of the question being answered
     * @param answerText the text of the answer
     * @throws IllegalStateException if the game is not accepting answers
     * @throws IllegalArgumentException if the player or question does not exist
     */
    public void acceptPlayerAnswer(String playerId, String questionId, String answerText) {
        if (!isAcceptingAnswers) {
            throw new IllegalStateException("Game is not currently accepting answers");
        }

        if (!players.containsKey(playerId)) {
            throw new IllegalArgumentException("Player with ID " + playerId + " does not exist in this game");
        }

        Question currentQuestion = getCurrentQuestion();
        if (currentQuestion == null || !currentQuestion.getId().equals(questionId)) {
            throw new IllegalArgumentException("Question with ID " + questionId + " is not the current question");
        }

        // Check if the player has already submitted an answer for this question
        boolean hasAlreadySubmitted = playerSubmissions.stream()
                .anyMatch(submission -> submission.getPlayerId().equals(playerId) && 
                         submission.getQuestionId().equals(questionId));

        if (hasAlreadySubmitted) {
            throw new IllegalStateException("Player has already submitted an answer for this question");
        }

        // Check if the answer is correct
        boolean isCorrect = currentQuestion.isCorrectAnswer(answerText);

        // Create a new submission
        PlayerSubmission submission = new PlayerSubmission(playerId, questionId, answerText, isCorrect);
        playerSubmissions.add(submission);

        // If the answer is correct, add points to the player's score
        if (isCorrect) {
            PlayerInGame player = players.get(playerId);
            player.addPoints(1); // Could be more sophisticated, e.g., based on time remaining
        }
    }

    /**
     * Decrements the question timer by one second.
     * If the timer reaches 0, stops accepting answers and updates the game status.
     */
    public void decrementQuestionTimer() {
        if (status != GameStatus.QUESTION_ACTIVE) {
            return; // Only decrement if a question is active
        }

        if (currentQuestionRemainingSeconds > 0) {
            currentQuestionRemainingSeconds--;

            // If the timer reaches 0, stop accepting answers
            if (currentQuestionRemainingSeconds == 0) {
                isAcceptingAnswers = false;
                status = GameStatus.QUESTION_CLOSED;
            }
        }
    }

    /**
     * Allows the admin to manually close the current question.
     *
     * @param adminId the ID of the admin
     * @throws IllegalArgumentException if the adminId does not match the game's adminId
     * @throws IllegalStateException if the game is not in the QUESTION_ACTIVE status
     */
    public void adminCloseCurrentQuestion(String adminId) {
        if (!this.adminId.equals(adminId)) {
            throw new IllegalArgumentException("Only the game admin can close the current question");
        }

        if (status != GameStatus.QUESTION_ACTIVE) {
            throw new IllegalStateException("No active question to close");
        }

        isAcceptingAnswers = false;
        status = GameStatus.QUESTION_CLOSED;
    }

    /**
     * Allows the admin to proceed to the next question or round.
     * If there are no more questions in the current round, moves to the next round.
     * If there are no more rounds, ends the game.
     *
     * @param adminId the ID of the admin
     * @throws IllegalArgumentException if the adminId does not match the game's adminId
     * @throws IllegalStateException if the game is not in the QUESTION_CLOSED status
     */
    public void adminProceedToNextQuestion(String adminId) {
        if (!this.adminId.equals(adminId)) {
            throw new IllegalArgumentException("Only the game admin can proceed to the next question");
        }

        if (status != GameStatus.QUESTION_CLOSED) {
            throw new IllegalStateException("Cannot proceed to next question until current question is closed");
        }

        // Complete the current round if this was the last question
        Round currentRound = getCurrentRound();
        if (currentQuestionIndex >= currentRound.getQuestions().size() - 1) {
            // This was the last question in the round
            currentRound.complete();

            // Move to the next round
            currentRoundIndex++;
            currentQuestionIndex = 0;

            // Check if this was the last round
            if (currentRoundIndex >= rounds.size()) {
                // Game is over
                status = GameStatus.GAME_OVER;
                return;
            } else {
                // New round
                status = GameStatus.ROUND_COMPLETED;
                return;
            }
        } else {
            // Move to the next question in the current round
            currentQuestionIndex++;
        }

        // Start the next question
        startCurrentQuestion();
    }

    /**
     * Allows the admin to start the next round after a round has been completed.
     *
     * @param adminId the ID of the admin
     * @throws IllegalArgumentException if the adminId does not match the game's adminId
     * @throws IllegalStateException if the game is not in the ROUND_COMPLETED status
     */
    public void adminStartNextRound(String adminId) {
        if (!this.adminId.equals(adminId)) {
            throw new IllegalArgumentException("Only the game admin can start the next round");
        }

        if (status != GameStatus.ROUND_COMPLETED) {
            throw new IllegalStateException("Cannot start next round until current round is completed");
        }

        // Start the first question of the new round
        startCurrentQuestion();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Game game = (Game) o;
        return Objects.equals(id, game.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
