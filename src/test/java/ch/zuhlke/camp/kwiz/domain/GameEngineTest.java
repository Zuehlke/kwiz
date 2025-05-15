package ch.zuhlke.camp.kwiz.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GameEngineTest {

    private GameEngine gameEngine;

    @BeforeEach
    void setUp() {
        gameEngine = new GameEngine();
    }

    @Test
    void shouldCreateNewQuiz() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxParticipants = 5;

        // When
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxParticipants);

        // Then
        assertNotNull(quiz);
        assertEquals(quizId, quiz.getId());
        assertEquals(quizName, quiz.getName());
        assertEquals(maxParticipants, quiz.getMaxParticipants());
        assertTrue(gameEngine.getQuizzes().contains(quiz));
    }

    @Test
    void shouldGetQuizById() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxParticipants = 5;
        gameEngine.createQuiz(quizId, quizName, maxParticipants);

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
    void shouldAddParticipantToQuiz() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxParticipants = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxParticipants);
        String participantName = "Participant A";

        // When
        Participant participant = gameEngine.addParticipantToQuiz(quizId, participantName);

        // Then
        assertNotNull(participant);
        assertEquals(participantName, participant.getName());
        assertTrue(quiz.getParticipants().contains(participant));
    }

    @Test
    void shouldNotAddParticipantWhenQuizDoesNotExist() {
        // When/Then
        assertThrows(IllegalArgumentException.class, () -> {
            gameEngine.addParticipantToQuiz("nonexistent", "Participant A");
        });
    }

    @Test
    void shouldNotAddParticipantWhenQuizHasStarted() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxParticipants = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxParticipants);

        // Add a round and a participant to the quiz
        Round round = gameEngine.addRoundToQuiz(quizId, "Round 1");
        gameEngine.addParticipantToQuiz(quizId, "Participant A");

        gameEngine.startQuiz(quizId);

        // When/Then
        assertThrows(IllegalStateException.class, () -> {
            gameEngine.addParticipantToQuiz(quizId, "Participant B");
        });
    }

    @Test
    void shouldStartQuiz() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxParticipants = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxParticipants);

        // Add a round and a participant to the quiz
        Round round = gameEngine.addRoundToQuiz(quizId, "Round 1");
        gameEngine.addParticipantToQuiz(quizId, "Participant A");

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
        int maxParticipants = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxParticipants);

        // Add a round and a participant to the quiz
        Round round = gameEngine.addRoundToQuiz(quizId, "Round 1");
        gameEngine.addParticipantToQuiz(quizId, "Participant A");

        gameEngine.startQuiz(quizId);

        // When
        gameEngine.endQuiz(quizId);

        // Then
        assertTrue(quiz.isEnded());
    }
}
