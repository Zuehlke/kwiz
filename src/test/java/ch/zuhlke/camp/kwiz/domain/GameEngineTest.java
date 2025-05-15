package ch.zuhlke.camp.kwiz.domain;

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
        gameEngine = new GameEngine(mockWebSocketController);
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
}
