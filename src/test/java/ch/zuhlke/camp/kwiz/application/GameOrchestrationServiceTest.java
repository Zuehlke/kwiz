package ch.zuhlke.camp.kwiz.application;

import ch.zuhlke.camp.kwiz.controller.WebSocketController;
import ch.zuhlke.camp.kwiz.domain.Game;
import ch.zuhlke.camp.kwiz.domain.GameEngine;
import ch.zuhlke.camp.kwiz.domain.GameStatus;
import ch.zuhlke.camp.kwiz.domain.Player;
import ch.zuhlke.camp.kwiz.domain.Question;
import ch.zuhlke.camp.kwiz.domain.Quiz;
import ch.zuhlke.camp.kwiz.domain.Round;
import ch.zuhlke.camp.kwiz.infrastructure.GameTimerScheduler;
import ch.zuhlke.camp.kwiz.infrastructure.InMemoryGameRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameOrchestrationServiceTest {
    @Mock
    private InMemoryGameRepository gameRepository;

    @Mock
    private WebSocketController webSocketController;

    @Mock
    private GameTimerScheduler gameTimerScheduler;

    @Mock
    private GameEngine gameEngine;

    private GameOrchestrationService gameOrchestrationService;

    private Quiz quiz;
    private Game game;
    private final String quizId = "quiz123";
    private final String adminId = "admin123";
    private final String playerId = "player123";
    private final String playerName = "Test Player";
    private final String gameId = "game123";
    private Round round;
    private Question question;

    @BeforeEach
    void setUp() {
        gameOrchestrationService = new GameOrchestrationService(gameRepository, webSocketController, gameTimerScheduler);

        // Create a quiz with a player and a round with a question
        quiz = new Quiz(quizId, "Test Quiz", 10);
        Player player = new Player(playerName);
        player.submitAnswer("dummy", "dummy"); // Just to set the ID field via reflection for testing
        setPrivateField(player, "id", playerId);
        quiz.addPlayer(player);

        round = new Round("Round 1");
        question = new Question("What is 2+2?", Collections.singletonList("4"), 10);
        round.addQuestion(question);
        quiz.addRound(round);

        // Create a game that will be returned by the repository
        game = new Game(quizId, adminId);
        game.addPlayer(playerId, playerName);
        game.startGame(Collections.singletonList(round));
        setPrivateField(game, "id", gameId);

        // Mock the repository to return the game - use lenient() to avoid "unnecessary stubbing" errors
        lenient().when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));
        lenient().when(gameRepository.save(any(Game.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    // Helper method to set private fields via reflection for testing
    private void setPrivateField(Object object, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = object.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(object, value);
        } catch (Exception e) {
            throw new RuntimeException("Error setting field " + fieldName, e);
        }
    }

    @Test
    void testCreateAndStartGame() {
        // Mock the repository to return the game ID
        when(gameRepository.save(any(Game.class))).thenAnswer(invocation -> {
            Game savedGame = invocation.getArgument(0);
            setPrivateField(savedGame, "id", gameId);
            return savedGame;
        });

        // Call the service method
        String resultGameId = gameOrchestrationService.createAndStartGame(new Quiz(quizId, "Test Quiz", 10));

        // Verify the result
        assertEquals(gameId, resultGameId);

        // Verify the repository was called to save the game
        verify(gameRepository).save(any(Game.class));

        // Verify the timer scheduler was called to register the game
        verify(gameTimerScheduler).registerGame(gameId);

        // Verify the WebSocket controller was called to broadcast the game state
        verify(webSocketController).broadcastGameState(eq(gameId), any(GameOrchestrationService.GameStateDTO.class));
    }

    @Test
    void testSubmitPlayerAnswer() {
        // Call the service method
        gameOrchestrationService.submitPlayerAnswer(gameId, playerId, question.getId(), "4");

        // Verify the repository was called to save the game
        verify(gameRepository).save(game);

        // Verify the WebSocket controller was called to broadcast the game state and send confirmation
        verify(webSocketController).broadcastGameState(eq(gameId), any(GameOrchestrationService.GameStateDTO.class));
        verify(webSocketController).sendPlayerAnswerConfirmation(gameId, playerId, question.getId());

        // Verify the player submission was added to the game
        assertEquals(1, game.getPlayerSubmissions().size());
        assertEquals(playerId, game.getPlayerSubmissions().get(0).getPlayerId());
        assertEquals(question.getId(), game.getPlayerSubmissions().get(0).getQuestionId());
        assertEquals("4", game.getPlayerSubmissions().get(0).getSubmittedAnswerText());
        assertTrue(game.getPlayerSubmissions().get(0).isCorrect());
    }

    @Test
    void testSubmitPlayerAnswerError() {
        // Set up the game to not accept answers
        game.adminCloseCurrentQuestion(adminId);

        // Call the service method and expect an exception
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            gameOrchestrationService.submitPlayerAnswer(gameId, playerId, question.getId(), "4");
        });

        // Verify the error message
        assertEquals("Game is not currently accepting answers", exception.getMessage());

        // Verify the WebSocket controller was called to send an error
        verify(webSocketController).sendPlayerAnswerError(eq(gameId), eq(playerId), eq(question.getId()), anyString());

        // Verify the repository was not called to save the game
        verify(gameRepository, never()).save(game);
    }

    @Test
    void testAdminCloseCurrentQuestion() {
        // Call the service method
        gameOrchestrationService.adminCloseCurrentQuestion(gameId, adminId);

        // Verify the game state
        assertEquals(GameStatus.QUESTION_CLOSED, game.getStatus());
        assertFalse(game.isAcceptingAnswers());

        // Verify the repository was called to save the game
        verify(gameRepository).save(game);

        // Verify the timer scheduler was called to unregister the game
        verify(gameTimerScheduler).unregisterGame(gameId);

        // Verify the WebSocket controller was called to broadcast the game state
        verify(webSocketController).broadcastGameState(eq(gameId), any(GameOrchestrationService.GameStateDTO.class));
    }

    @Test
    void testAdminAdvanceToNextQuestion() {
        // Set up a game with multiple questions
        Round multiQuestionRound = new Round("Round 1");
        Question question1 = new Question("Question 1", Collections.singletonList("A"), 10);
        Question question2 = new Question("Question 2", Collections.singletonList("B"), 10);
        multiQuestionRound.addQuestion(question1);
        multiQuestionRound.addQuestion(question2);

        Game multiQuestionGame = new Game(quizId, adminId);
        multiQuestionGame.addPlayer(playerId, playerName);
        multiQuestionGame.startGame(Collections.singletonList(multiQuestionRound));
        setPrivateField(multiQuestionGame, "id", gameId);

        // Close the current question
        multiQuestionGame.adminCloseCurrentQuestion(adminId);

        // Mock the repository to return the multi-question game
        when(gameRepository.findById(gameId)).thenReturn(Optional.of(multiQuestionGame));

        // Call the service method
        gameOrchestrationService.adminAdvanceToNextQuestion(gameId, adminId);

        // Verify the game state
        assertEquals(GameStatus.QUESTION_ACTIVE, multiQuestionGame.getStatus());
        assertEquals(0, multiQuestionGame.getCurrentRoundIndex());
        assertEquals(1, multiQuestionGame.getCurrentQuestionIndex());
        assertTrue(multiQuestionGame.isAcceptingAnswers());

        // Verify the repository was called to save the game
        verify(gameRepository).save(multiQuestionGame);

        // Verify the timer scheduler was called to register the game
        verify(gameTimerScheduler).registerGame(gameId);

        // Verify the WebSocket controller was called to broadcast the game state
        verify(webSocketController).broadcastGameState(eq(gameId), any(GameOrchestrationService.GameStateDTO.class));
    }

    @Test
    void testAdminStartNextRound() {
        // Set up a game with multiple rounds
        Round round1 = new Round("Round 1");
        Question question1 = new Question("Question 1", Collections.singletonList("A"), 10);
        round1.addQuestion(question1);

        Round round2 = new Round("Round 2");
        Question question2 = new Question("Question 2", Collections.singletonList("B"), 10);
        round2.addQuestion(question2);

        Game multiRoundGame = new Game(quizId, adminId);
        multiRoundGame.addPlayer(playerId, playerName);
        multiRoundGame.startGame(java.util.Arrays.asList(round1, round2));
        setPrivateField(multiRoundGame, "id", gameId);

        // Close the current question
        multiRoundGame.adminCloseCurrentQuestion(adminId);

        // Mock the repository to return the multi-round game
        when(gameRepository.findById(gameId)).thenReturn(Optional.of(multiRoundGame));

        // Call the service method to advance to the next question/round
        gameOrchestrationService.adminAdvanceToNextQuestion(gameId, adminId);

        // Verify the game state after advancing to the next round
        assertEquals(GameStatus.QUESTION_ACTIVE, multiRoundGame.getStatus());
        assertEquals(1, multiRoundGame.getCurrentRoundIndex());
        assertEquals(0, multiRoundGame.getCurrentQuestionIndex());
        assertTrue(multiRoundGame.isAcceptingAnswers());

        // Verify the repository was called to save the game
        verify(gameRepository).save(multiRoundGame);

        // Verify the timer scheduler was called to register the game
        verify(gameTimerScheduler).registerGame(gameId);

        // Verify the WebSocket controller was called to broadcast the game state
        verify(webSocketController).broadcastGameState(eq(gameId), any(GameOrchestrationService.GameStateDTO.class));
    }

    @Test
    void testHandleGameTick() {
        // Initial timer value
        assertEquals(10, game.getCurrentQuestionRemainingSeconds());

        // Call the service method
        gameOrchestrationService.handleGameTick(gameId);

        // Verify the timer was decremented
        assertEquals(9, game.getCurrentQuestionRemainingSeconds());

        // Verify the repository was called to save the game
        verify(gameRepository).save(game);

        // Verify the WebSocket controller was called to broadcast the game state
        verify(webSocketController).broadcastGameState(eq(gameId), any(GameOrchestrationService.GameStateDTO.class));
    }

    @Test
    void testGetGameSnapshot() {
        // Call the service method
        GameOrchestrationService.GameStateDTO gameState = gameOrchestrationService.getGameSnapshot(gameId);

        // Verify the game state
        assertEquals(gameId, gameState.getGameId());
        assertEquals(quizId, gameState.getQuizDefinitionId());
        assertEquals(GameStatus.QUESTION_ACTIVE, gameState.getStatus());
        assertEquals(round.getId(), gameState.getCurrentRoundId());
        assertEquals(round.getName(), gameState.getCurrentRoundName());
        assertEquals(question.getId(), gameState.getCurrentQuestionId());
        assertEquals(question.getText(), gameState.getCurrentQuestionText());
        assertEquals(10, gameState.getRemainingSeconds());
        assertTrue(gameState.isAcceptingAnswers());
        assertEquals(1, gameState.getPlayers().size());
        assertEquals(playerId, gameState.getPlayers().get(0).getPlayerId());
        assertEquals(playerName, gameState.getPlayers().get(0).getDisplayName());
        assertEquals(0, gameState.getPlayers().get(0).getScore());
    }
}
