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
        int maxTeams = 5;

        // When
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxTeams);

        // Then
        assertNotNull(quiz);
        assertEquals(quizId, quiz.getId());
        assertEquals(quizName, quiz.getName());
        assertEquals(maxTeams, quiz.getMaxTeams());
        assertTrue(gameEngine.getQuizzes().contains(quiz));
    }

    @Test
    void shouldGetQuizById() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxTeams = 5;
        gameEngine.createQuiz(quizId, quizName, maxTeams);

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
    void shouldAddTeamToQuiz() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxTeams = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxTeams);
        String teamName = "Team A";

        // When
        Team team = gameEngine.addTeamToQuiz(quizId, teamName);

        // Then
        assertNotNull(team);
        assertEquals(teamName, team.getName());
        assertTrue(quiz.getTeams().contains(team));
    }

    @Test
    void shouldNotAddTeamWhenQuizDoesNotExist() {
        // When/Then
        assertThrows(IllegalArgumentException.class, () -> {
            gameEngine.addTeamToQuiz("nonexistent", "Team A");
        });
    }

    @Test
    void shouldNotAddTeamWhenQuizHasStarted() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxTeams = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxTeams);

        // Add a round and a team to the quiz
        Round round = gameEngine.addRoundToQuiz(quizId, "Round 1");
        gameEngine.addTeamToQuiz(quizId, "Team A");

        gameEngine.startQuiz(quizId);

        // When/Then
        assertThrows(IllegalStateException.class, () -> {
            gameEngine.addTeamToQuiz(quizId, "Team B");
        });
    }

    @Test
    void shouldStartQuiz() {
        // Given
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int maxTeams = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxTeams);

        // Add a round and a team to the quiz
        Round round = gameEngine.addRoundToQuiz(quizId, "Round 1");
        gameEngine.addTeamToQuiz(quizId, "Team A");

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
        int maxTeams = 5;
        Quiz quiz = gameEngine.createQuiz(quizId, quizName, maxTeams);

        // Add a round and a team to the quiz
        Round round = gameEngine.addRoundToQuiz(quizId, "Round 1");
        gameEngine.addTeamToQuiz(quizId, "Team A");

        gameEngine.startQuiz(quizId);

        // When
        gameEngine.endQuiz(quizId);

        // Then
        assertTrue(quiz.isEnded());
    }
}
