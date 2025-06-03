package ch.zuhlke.camp.kwiz.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GameTest {
    private Game game;
    private final String adminId = "admin123";
    private final String playerId = "player123";
    private final String playerName = "Test Player";
    private Round round;
    private Question question;

    @BeforeEach
    void setUp() {
        // Create a new game
        game = new Game("quiz123", adminId);

        // Add a player
        game.addPlayer(playerId, playerName);

        // Create a round with a question
        round = new Round("Round 1");
        question = new Question("What is 2+2?", Collections.singletonList("4"), 10);
        round.addQuestion(question);
    }

    @Test
    void testGameInitialization() {
        assertEquals("quiz123", game.getQuizDefinitionId());
        assertEquals(adminId, game.getAdminId());
        assertEquals(GameStatus.LOBBY, game.getStatus());
        assertEquals(1, game.getPlayers().size());
        assertTrue(game.getPlayers().containsKey(playerId));
        assertEquals(playerName, game.getPlayers().get(playerId).getDisplayName());
    }

    @Test
    void testStartGame() {
        // Start the game with a round
        game.startGame(Collections.singletonList(round));

        // Verify game state
        assertEquals(GameStatus.QUESTION_ACTIVE, game.getStatus());
        assertEquals(0, game.getCurrentRoundIndex());
        assertEquals(0, game.getCurrentQuestionIndex());
        assertEquals(10, game.getCurrentQuestionRemainingSeconds());
        assertTrue(game.isAcceptingAnswers());
        assertNotNull(game.getCurrentRound());
        assertNotNull(game.getCurrentQuestion());
        assertEquals(question.getId(), game.getCurrentQuestion().getId());
    }

    @Test
    void testStartGameWithoutRounds() {
        // Attempt to start the game without rounds
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            game.startGame(Collections.emptyList());
        });

        assertEquals("Cannot start game without rounds", exception.getMessage());
    }

    @Test
    void testStartGameWithoutPlayers() {
        // Create a new game without players
        Game emptyGame = new Game("quiz123", adminId);

        // Attempt to start the game without players
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            emptyGame.startGame(Collections.singletonList(round));
        });

        assertEquals("Cannot start game without players", exception.getMessage());
    }

    @Test
    void testAcceptPlayerAnswer() {
        // Start the game
        game.startGame(Collections.singletonList(round));

        // Submit a correct answer
        game.acceptPlayerAnswer(playerId, question.getId(), "4");

        // Verify the submission was recorded
        assertEquals(1, game.getPlayerSubmissions().size());
        assertEquals(playerId, game.getPlayerSubmissions().get(0).getPlayerId());
        assertEquals(question.getId(), game.getPlayerSubmissions().get(0).getQuestionId());
        assertEquals("4", game.getPlayerSubmissions().get(0).getSubmittedAnswerText());
        assertTrue(game.getPlayerSubmissions().get(0).isCorrect());

        // Verify the player's score was updated
        // Since we can't control the exact timing in this test, we just verify that points were awarded
        assertTrue(game.getPlayers().get(playerId).getScore() > 0);
    }

    @Test
    void testPointCalculationBasedOnTimeLeft() {
        // Create a game with a question that has a 10-second time limit
        Game testGame = new Game("quiz123", adminId);
        testGame.addPlayer(playerId, playerName);

        Round testRound = new Round("Test Round");
        Question testQuestion = new Question("Test Question", Collections.singletonList("correct"), 10);
        testRound.addQuestion(testQuestion);

        // Start the game
        testGame.startGame(Collections.singletonList(testRound));

        // Get the current question start time
        long startTime = testGame.getCurrentQuestionStartTime();

        // Test case 1: Answer immediately (should get close to 100 points)
        // We can't directly manipulate the timestamp, so we'll use reflection to access the private calculatePoints method
        int pointsImmediate = calculatePointsWithReflection(testGame, 0);
        assertEquals(100, pointsImmediate, "Answering immediately should award 100 points");

        // Test case 2: Answer after half the time (should get around 50 points)
        int pointsHalfTime = calculatePointsWithReflection(testGame, 5000);
        assertEquals(50, pointsHalfTime, "Answering after half the time should award 50 points");

        // Test case 3: Answer at the last moment (should get minimum 1 point)
        int pointsLastMoment = calculatePointsWithReflection(testGame, 9999);
        assertEquals(1, pointsLastMoment, "Answering at the last moment should award 1 point");
    }

    @Test
    void testZeroPointsForIncorrectAnswers() {
        // Start the game
        game.startGame(Collections.singletonList(round));

        // Submit an incorrect answer
        game.acceptPlayerAnswer(playerId, question.getId(), "wrong");

        // Verify the player's score was not updated (remains 0)
        assertEquals(0, game.getPlayers().get(playerId).getScore(), "Incorrect answers should award 0 points regardless of timing");
    }

    /**
     * Helper method to calculate points using reflection to access the private calculatePoints method
     */
    private int calculatePointsWithReflection(Game game, long answerTimeMs) {
        try {
            // Get the calculatePoints method
            java.lang.reflect.Method calculatePointsMethod = Game.class.getDeclaredMethod("calculatePoints", long.class);
            calculatePointsMethod.setAccessible(true);

            // Call the method and return the result
            return (int) calculatePointsMethod.invoke(game, answerTimeMs);
        } catch (Exception e) {
            fail("Failed to call calculatePoints method via reflection: " + e.getMessage());
            return 0;
        }
    }

    @Test
    void testAcceptPlayerAnswerIncorrect() {
        // Start the game
        game.startGame(Collections.singletonList(round));

        // Submit an incorrect answer
        game.acceptPlayerAnswer(playerId, question.getId(), "5");

        // Verify the submission was recorded
        assertEquals(1, game.getPlayerSubmissions().size());
        assertEquals(playerId, game.getPlayerSubmissions().get(0).getPlayerId());
        assertEquals(question.getId(), game.getPlayerSubmissions().get(0).getQuestionId());
        assertEquals("5", game.getPlayerSubmissions().get(0).getSubmittedAnswerText());
        assertFalse(game.getPlayerSubmissions().get(0).isCorrect());

        // Verify the player's score was not updated
        assertEquals(0, game.getPlayers().get(playerId).getScore());
    }

    @Test
    void testAcceptPlayerAnswerWhenNotAccepting() {
        // Start the game
        game.startGame(Collections.singletonList(round));

        // Close the question
        game.adminCloseCurrentQuestion(adminId);

        // Attempt to submit an answer when not accepting
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            game.acceptPlayerAnswer(playerId, question.getId(), "4");
        });

        assertEquals("Game is not currently accepting answers", exception.getMessage());
    }

    @Test
    void testDecrementQuestionTimer() {
        // Start the game
        game.startGame(Collections.singletonList(round));

        // Initial timer value
        assertEquals(10, game.getCurrentQuestionRemainingSeconds());

        // Decrement the timer
        game.decrementQuestionTimer();

        // Verify the timer was decremented
        assertEquals(9, game.getCurrentQuestionRemainingSeconds());
        assertEquals(GameStatus.QUESTION_ACTIVE, game.getStatus());
        assertTrue(game.isAcceptingAnswers());

        // Decrement to zero
        for (int i = 0; i < 9; i++) {
            game.decrementQuestionTimer();
        }

        // Verify the question is closed
        assertEquals(0, game.getCurrentQuestionRemainingSeconds());
        assertEquals(GameStatus.QUESTION_CLOSED, game.getStatus());
        assertFalse(game.isAcceptingAnswers());
    }

    @Test
    void testAdminCloseCurrentQuestion() {
        // Start the game
        game.startGame(Collections.singletonList(round));

        // Close the question
        game.adminCloseCurrentQuestion(adminId);

        // Verify the question is closed
        assertEquals(GameStatus.QUESTION_CLOSED, game.getStatus());
        assertFalse(game.isAcceptingAnswers());
    }

    @Test
    void testAdminProceedToNextQuestion() {
        // Create a round with multiple questions
        Round multiQuestionRound = new Round("Round 1");
        Question question1 = new Question("Question 1", Collections.singletonList("A"), 10);
        Question question2 = new Question("Question 2", Collections.singletonList("B"), 10);
        multiQuestionRound.addQuestion(question1);
        multiQuestionRound.addQuestion(question2);

        // Start the game
        game.startGame(Collections.singletonList(multiQuestionRound));

        // Close the first question
        game.adminCloseCurrentQuestion(adminId);

        // Proceed to the next question
        game.adminProceedToNextQuestion(adminId);

        // Verify we're on the second question
        assertEquals(0, game.getCurrentRoundIndex());
        assertEquals(1, game.getCurrentQuestionIndex());
        assertEquals(question2.getId(), game.getCurrentQuestion().getId());
        assertEquals(GameStatus.QUESTION_ACTIVE, game.getStatus());
        assertTrue(game.isAcceptingAnswers());
    }

    @Test
    void testAdminProceedToNextRound() {
        // Create two rounds
        Round round1 = new Round("Round 1");
        Question question1 = new Question("Question 1", Collections.singletonList("A"), 10);
        round1.addQuestion(question1);

        Round round2 = new Round("Round 2");
        Question question2 = new Question("Question 2", Collections.singletonList("B"), 10);
        round2.addQuestion(question2);

        // Start the game with both rounds
        game.startGame(Arrays.asList(round1, round2));

        // Close the question
        game.adminCloseCurrentQuestion(adminId);

        // Proceed to the next round
        game.adminProceedToNextQuestion(adminId);

        // Verify we're on the first question of the second round
        assertEquals(1, game.getCurrentRoundIndex());
        assertEquals(0, game.getCurrentQuestionIndex());
        assertEquals(question2.getId(), game.getCurrentQuestion().getId());
        assertEquals(GameStatus.QUESTION_ACTIVE, game.getStatus());
        assertTrue(game.isAcceptingAnswers());
    }

    @Test
    void testGameOver() {
        // Create a round with a single question
        Round singleQuestionRound = new Round("Round 1");
        Question singleQuestion = new Question("Question 1", Collections.singletonList("A"), 10);
        singleQuestionRound.addQuestion(singleQuestion);

        // Start the game
        game.startGame(Collections.singletonList(singleQuestionRound));

        // Close the question
        game.adminCloseCurrentQuestion(adminId);

        // Proceed to the next question (which should end the game)
        game.adminProceedToNextQuestion(adminId);

        // Verify the game is over
        assertEquals(GameStatus.GAME_OVER, game.getStatus());
    }
}
