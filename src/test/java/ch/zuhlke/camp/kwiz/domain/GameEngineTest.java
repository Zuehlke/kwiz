package ch.zuhlke.camp.kwiz.domain;

import ch.zuhlke.camp.kwiz.application.GameOrchestrationService;
import ch.zuhlke.camp.kwiz.controller.WebSocketController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GameEngineTest {

    private GameEngine gameEngine;

    @BeforeEach
    void setUp() {
        WebSocketController mockWebSocketController = Mockito.mock(WebSocketController.class);
        GameOrchestrationService gameOrchestrationService = Mockito.mock(GameOrchestrationService.class);
        gameEngine = new GameEngine(mockWebSocketController, gameOrchestrationService);
    }

    @Test
    void shouldCreateNewQuiz() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;

        // When
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxPlayers);

        // Then
        assertNotNull(quiz);
        assertEquals(quizId, quiz.getId());
        assertEquals(quizName, quiz.getName());
        assertEquals(maxPlayers, quiz.getMaxPlayers());
        assertTrue(gameEngine.getQuizzes().contains(quiz));

        // Verify that a default round was created
        assertFalse(quiz.getRounds().isEmpty(), "Quiz should have at least one round");
        assertEquals(1, quiz.getRounds().size(), "Quiz should have exactly one round");
        assertEquals("Round 1", quiz.getRounds().get(0).getName(), "The round should be named 'Round 1'");
    }

    @Test
    void shouldGetQuizById() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        gameEngine.createQuiz(quizId, quizName, maxPlayers);

        // When
        Quiz quiz = gameEngine.getQuizById(quizId);

        // Then
        assertNotNull(quiz);
        assertEquals(quizId, quiz.getId());
    }

    @Test
    void shouldReturnNullForNonExistentQuiz() {
        // When
        Quiz quiz = gameEngine.getQuizById("nonexistent");

        // Then
        assertNull(quiz);
    }

    @Test
    void shouldAddPlayerToQuiz() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxPlayers);
        String playerName = "Player A";

        // When
        Player player = gameEngine.addPlayerToQuiz(quizId, playerName);

        // Then
        assertNotNull(player);
        assertEquals(playerName, player.getName());
        assertTrue(quiz.getPlayers().contains(player));
    }

    @Test
    void shouldNotAddPlayerWhenQuizDoesNotExist() {
        // When/Then
        assertThrows(IllegalArgumentException.class, () -> {
            gameEngine.addPlayerToQuiz("nonexistent", "Player A");
        });
    }

    @Test
    void shouldNotAddPlayerWhenQuizHasStarted() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxPlayers);

        // Add a round and a player to the quiz
        Round round = gameEngine.addRoundToQuiz(quizId, "Round 1");
        gameEngine.addPlayerToQuiz(quizId, "Player A");

        gameEngine.startQuiz(quizId);

        // When/Then
        assertThrows(IllegalStateException.class, () -> {
            gameEngine.addPlayerToQuiz(quizId, "Player B");
        });
    }

    @Test
    void shouldStartQuiz() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxPlayers);

        // Add a round and a player to the quiz
        Round round = gameEngine.addRoundToQuiz(quizId, "Round 1");
        gameEngine.addPlayerToQuiz(quizId, "Player A");

        // When
        gameEngine.startQuiz(quizId);

        // Then
        assertTrue(quiz.isStarted());
    }

    @Test
    void shouldEndQuiz() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxPlayers);

        // Add a round and a player to the quiz
        Round round = gameEngine.addRoundToQuiz(quizId, "Round 1");
        gameEngine.addPlayerToQuiz(quizId, "Player A");

        gameEngine.startQuiz(quizId);

        // When
        gameEngine.endQuiz(quizId);

        // Then
        assertTrue(quiz.isEnded());
    }

    @Test
    void shouldSubmitParticipantQuestion() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxPlayers);
        Player player = gameEngine.addPlayerToQuiz(quizId, "Player A");

        // Create a round for participant questions
        Round round = gameEngine.addRoundToQuiz(quizId, "My Round");

        String questionText = "What is the capital of France?";
        List<String> correctAnswers = Arrays.asList("Paris");
        int timeLimit = 30;

        // When
        Question question = gameEngine.submitParticipantQuestion(quizId, player.getId(), round.getId(), questionText, correctAnswers, timeLimit);

        // Then
        assertNotNull(question);
        assertEquals(questionText, question.getText());
        assertEquals(correctAnswers, question.getCorrectAnswers());
        assertEquals(timeLimit, question.getTimeLimit());

        // Verify that the question was added to the specified round
        boolean questionFound = false;
        for (Round r : quiz.getRounds()) {
            if (r.getId().equals(round.getId())) {
                for (Question q : r.getQuestions()) {
                    if (q.getId().equals(question.getId())) {
                        questionFound = true;
                        break;
                    }
                }
            }
        }
        assertTrue(questionFound, "Question should be added to the specified round");
    }

    @Test
    void shouldNotSubmitParticipantQuestionWhenQuizHasStarted() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxPlayers);
        Player player = gameEngine.addPlayerToQuiz(quizId, "Player A");

        // Add a round to the quiz so it can be started
        Round round = gameEngine.addRoundToQuiz(quizId, "Round 1");

        // Create another round for participant questions
        Round participantRound = gameEngine.addRoundToQuiz(quizId, "My Round");

        // Start the quiz
        gameEngine.startQuiz(quizId);

        String questionText = "What is the capital of France?";
        List<String> correctAnswers = Arrays.asList("Paris");
        int timeLimit = 30;

        // When/Then
        assertThrows(IllegalStateException.class, () -> {
            gameEngine.submitParticipantQuestion(quizId, player.getId(), participantRound.getId(), questionText, correctAnswers, timeLimit);
        });
    }

    @Test
    void shouldNotSubmitParticipantQuestionWhenRoundDoesNotExist() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxPlayers);
        Player player = gameEngine.addPlayerToQuiz(quizId, "Player A");

        String questionText = "What is the capital of France?";
        List<String> correctAnswers = Arrays.asList("Paris");
        int timeLimit = 30;
        String nonExistentRoundId = "non-existent-round-id";

        // When/Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            gameEngine.submitParticipantQuestion(quizId, player.getId(), nonExistentRoundId, questionText, correctAnswers, timeLimit);
        });

        // Verify the exception message
        assertTrue(exception.getMessage().contains("No round found with ID"));
    }

    @Test
    void shouldNotAddPlayerWithEmptyName() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        gameEngine.createQuiz(quizId, quizName, maxPlayers);

        // When/Then with empty name
        IllegalArgumentException emptyNameException = assertThrows(IllegalArgumentException.class, () -> {
            gameEngine.addPlayerToQuiz(quizId, "");
        });

        // Verify the exception message for empty name
        assertTrue(emptyNameException.getMessage().contains("Player name cannot be empty"));

        // When/Then with null name
        IllegalArgumentException nullNameException = assertThrows(IllegalArgumentException.class, () -> {
            gameEngine.addPlayerToQuiz(quizId, null);
        });

        // Verify the exception message for null name
        assertTrue(nullNameException.getMessage().contains("Player name cannot be empty"));

        // When/Then with whitespace name
        IllegalArgumentException whitespaceNameException = assertThrows(IllegalArgumentException.class, () -> {
            gameEngine.addPlayerToQuiz(quizId, "   ");
        });

        // Verify the exception message for whitespace name
        assertTrue(whitespaceNameException.getMessage().contains("Player name cannot be empty"));
    }

    @Test
    void shouldUpdateMaxPlayers() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int initialMaxPlayers = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, initialMaxPlayers);

        // Add a player to the quiz
        Player player = gameEngine.addPlayerToQuiz(quizId, "Player A");

        int newMaxPlayers = 10;

        // When
        Quiz updatedQuiz = gameEngine.updateMaxPlayers(quizId, newMaxPlayers);

        // Then
        assertNotNull(updatedQuiz);
        assertEquals(quizId, updatedQuiz.getId());
        assertEquals(quizName, updatedQuiz.getName());
        assertEquals(newMaxPlayers, updatedQuiz.getMaxPlayers());

        // Verify that the players were preserved
        assertEquals(2, updatedQuiz.getPlayers().size());
        assertTrue(updatedQuiz.getPlayers().contains(player));
    }

    @Test
    void shouldNotUpdateMaxPlayersWhenQuizDoesNotExist() {
        // When/Then
        assertThrows(IllegalArgumentException.class, () -> {
            gameEngine.updateMaxPlayers("nonexistent", 10);
        });
    }

    @Test
    void shouldNotUpdateMaxPlayersWhenQuizHasStarted() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxPlayers);

        // Add a player to the quiz
        gameEngine.addPlayerToQuiz(quizId, "Player A");

        // Start the quiz
        gameEngine.startQuiz(quizId);

        // When/Then
        assertThrows(IllegalStateException.class, () -> {
            gameEngine.updateMaxPlayers(quizId, 10);
        });
    }

    @Test
    void shouldNotUpdateMaxPlayersWhenNewMaxIsLessThanCurrentPlayerCount() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxPlayers = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxPlayers);

        // Add players to the quiz
        gameEngine.addPlayerToQuiz(quizId, "Player A");
        gameEngine.addPlayerToQuiz(quizId, "Player B");
        gameEngine.addPlayerToQuiz(quizId, "Player C");

        int newMaxPlayers = 2; // Less than the current player count (3)

        // When/Then
        assertThrows(IllegalArgumentException.class, () -> {
            gameEngine.updateMaxPlayers(quizId, newMaxPlayers);
        });
    }
}
