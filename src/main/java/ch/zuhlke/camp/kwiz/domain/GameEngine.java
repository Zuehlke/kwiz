package ch.zuhlke.camp.kwiz.domain;

import ch.zuhlke.camp.kwiz.controller.WebSocketController;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * GameEngine is the main class that manages the game state.
 * It is responsible for creating and retrieving quizzes, adding players to quizzes,
 * and managing the quiz lifecycle.
 */
@Component
public class GameEngine {
    private final Map<String, Quiz> quizzes;
    private final WebSocketController webSocketController;

    public GameEngine(WebSocketController webSocketController) {
        this.quizzes = new ConcurrentHashMap<>();
        this.webSocketController = webSocketController;
    }

    /**
     * Creates a new quiz with the given ID, name, and maximum number of players.
     * Also creates a default round for the quiz.
     *
     * @param quizId          the unique ID of the quiz
     * @param quizName        the name of the quiz
     * @param maxPlayers the maximum number of players allowed in the quiz
     * @return the created quiz
     */
    public Quiz createQuiz(String quizId, String quizName, int maxPlayers) {
        Quiz quiz = new Quiz(quizId, quizName, maxPlayers);
        quizzes.put(quizId, quiz);

        // Create a default round for the quiz
        Round defaultRound = new Round("Default Round");
        quiz.addRound(defaultRound);

        return quiz;
    }

    /**
     * Retrieves a quiz by its ID.
     *
     * @param quizId the ID of the quiz to retrieve
     * @return the quiz with the given ID, or null if no such quiz exists
     */
    public Quiz getQuizById(String quizId) {
        return quizzes.get(quizId);
    }

    /**
     * Returns all quizzes managed by the game engine.
     *
     * @return an unmodifiable list of all quizzes
     */
    public List<Quiz> getQuizzes() {
        return Collections.unmodifiableList(new ArrayList<>(quizzes.values()));
    }

    /**
     * Adds a player to a quiz.
     *
     * @param quizId          the ID of the quiz to add the player to
     * @param playerName the name of the player to add
     * @return the created player
     * @throws IllegalArgumentException if no quiz with the given ID exists
     * @throws IllegalStateException    if the quiz has already started
     */
    public Player addPlayerToQuiz(String quizId, String playerName) {
        Quiz quiz = getQuizById(quizId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizId);
        }

        if (quiz.isStarted()) {
            throw new IllegalStateException("Cannot add player to a quiz that has already started");
        }

        if (playerName == null || playerName.trim().isEmpty()) {
            throw new IllegalArgumentException("Player name cannot be empty");
        }

        Player player = new Player(playerName);
        quiz.addPlayer(player);

        // Send WebSocket message with updated quiz information
        webSocketController.sendQuizUpdate(quizId, quiz.getPlayers().size(), quiz.getMaxPlayers(), quiz.isStarted(), quiz.getPlayers());

        return player;
    }

    /**
     * Starts a quiz.
     *
     * @param quizId the ID of the quiz to start
     * @throws IllegalArgumentException if no quiz with the given ID exists
     */
    public void startQuiz(String quizId) {
        Quiz quiz = getQuizById(quizId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizId);
        }

        quiz.start();

        // Send WebSocket message with updated quiz information
        webSocketController.sendQuizUpdate(quizId, quiz.getPlayers().size(), quiz.getMaxPlayers(), quiz.isStarted(), quiz.getPlayers());
    }

    /**
     * Ends a quiz.
     *
     * @param quizId the ID of the quiz to end
     * @throws IllegalArgumentException if no quiz with the given ID exists
     */
    public void endQuiz(String quizId) {
        Quiz quiz = getQuizById(quizId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizId);
        }

        quiz.end();
    }

    /**
     * Adds a round to a quiz.
     *
     * @param quizId    the ID of the quiz to add the round to
     * @param roundName the name of the round to add
     * @return the created round
     * @throws IllegalArgumentException if no quiz with the given ID exists
     * @throws IllegalStateException    if the quiz has already started
     */
    public Round addRoundToQuiz(String quizId, String roundName) {
        Quiz quiz = getQuizById(quizId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizId);
        }

        if (quiz.isStarted()) {
            throw new IllegalStateException("Cannot add round to a quiz that has already started");
        }

        Round round = new Round(roundName);
        quiz.addRound(round);
        return round;
    }

    /**
     * Adds a question to a round.
     *
     * @param quizId       the ID of the quiz containing the round
     * @param roundId      the ID of the round to add the question to
     * @param questionText the text of the question
     * @param correctAnswers the list of correct answers
     * @param timeLimit    the time limit for the question in seconds
     * @return the created question
     * @throws IllegalArgumentException if no quiz with the given ID exists, or no round with the given ID exists
     * @throws IllegalStateException    if the round is active or completed
     */
    public Question addQuestionToRound(String quizId, String roundId, String questionText, List<String> correctAnswers, int timeLimit) {
        Quiz quiz = getQuizById(quizId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizId);
        }

        Round round = quiz.getRounds().stream()
                .filter(r -> r.getId().equals(roundId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No round found with ID: " + roundId));

        if (round.isActive() || round.isCompleted()) {
            throw new IllegalStateException("Cannot add question to an active or completed round");
        }

        Question question = new Question(questionText, correctAnswers, timeLimit);
        round.addQuestion(question);
        return question;
    }

    /**
     * Submits an answer for a player.
     *
     * @param quizId        the ID of the quiz
     * @param playerId the ID of the player submitting the answer
     * @param questionId    the ID of the question being answered
     * @param answerText    the text of the answer
     * @throws IllegalArgumentException if no quiz with the given ID exists, no player with the given ID exists, or no question with the given ID exists
     * @throws IllegalStateException    if the quiz has not started or has ended
     */
    public void submitAnswer(String quizId, String playerId, String questionId, String answerText) {
        Quiz quiz = getQuizById(quizId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizId);
        }

        if (!quiz.isStarted() || quiz.isEnded()) {
            throw new IllegalStateException("Cannot submit answer to a quiz that has not started or has ended");
        }

        Player player = quiz.getPlayers().stream()
                .filter(p -> p.getId().equals(playerId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No player found with ID: " + playerId));

        // Find the question to check if the answer is correct
        Question question = quiz.getRounds().stream()
                .flatMap(round -> round.getQuestions().stream())
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No question found with ID: " + questionId));

        player.submitAnswer(questionId, answerText);

        // Mark the answer as correct if it matches any of the correct answers
        if (question.isCorrectAnswer(answerText)) {
            Answer answer = player.getAnswerForQuestion(questionId);
            answer.markAsCorrect();
        }
    }

    /**
     * Allows a participant to submit a question to a quiz.
     * The question will be added to the specified round.
     * This is only allowed if the quiz has not started yet.
     *
     * @param quizId the ID of the quiz to add the question to
     * @param playerId the ID of the player submitting the question
     * @param roundId the ID of the round to add the question to
     * @param questionText the text of the question
     * @param correctAnswers the list of correct answers
     * @param timeLimit the time limit for the question in seconds
     * @return the created question
     * @throws IllegalArgumentException if no quiz with the given ID exists, no player with the given ID exists, or no round with the given ID exists
     * @throws IllegalStateException if the quiz has already started
     */
    public Question submitParticipantQuestion(String quizId, String playerId, String roundId, String questionText, List<String> correctAnswers, int timeLimit) {
        Quiz quiz = getQuizById(quizId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizId);
        }

        if (quiz.isStarted()) {
            throw new IllegalStateException("Cannot submit questions after the quiz has started");
        }

        Player player = quiz.getPlayers().stream()
                .filter(p -> p.getId().equals(playerId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No player found with ID: " + playerId));

        // Find the specified round
        Round round = quiz.getRounds().stream()
                .filter(r -> r.getId().equals(roundId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No round found with ID: " + roundId));

        // Add the question to the round with the player ID as the submitter
        Question question = new Question(questionText, correctAnswers, timeLimit, playerId);
        round.addQuestion(question);
        return question;
    }

    /**
     * Represents a question with its associated round information.
     */
    public static class QuestionWithRound {
        private final Question question;
        private final String roundId;
        private final String roundName;

        public QuestionWithRound(Question question, String roundId, String roundName) {
            this.question = question;
            this.roundId = roundId;
            this.roundName = roundName;
        }

        public Question getQuestion() {
            return question;
        }

        public String getRoundId() {
            return roundId;
        }

        public String getRoundName() {
            return roundName;
        }
    }

    /**
     * Retrieves all questions submitted by a specific player in a quiz.
     *
     * @param quizId the ID of the quiz
     * @param playerId the ID of the player
     * @return a list of questions with their associated round information submitted by the player
     * @throws IllegalArgumentException if no quiz with the given ID exists, or no player with the given ID exists
     */
    public List<QuestionWithRound> getQuestionsSubmittedByPlayer(String quizId, String playerId) {
        Quiz quiz = getQuizById(quizId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizId);
        }

        // Verify the player exists in the quiz
        boolean playerExists = quiz.getPlayers().stream()
                .anyMatch(p -> p.getId().equals(playerId));
        if (!playerExists) {
            throw new IllegalArgumentException("No player found with ID: " + playerId);
        }

        // Find all questions submitted by the player across all rounds, including round information
        List<QuestionWithRound> questionsWithRounds = new ArrayList<>();
        for (Round round : quiz.getRounds()) {
            for (Question question : round.getQuestions()) {
                if (playerId.equals(question.getSubmitterId())) {
                    questionsWithRounds.add(new QuestionWithRound(question, round.getId(), round.getName()));
                }
            }
        }
        return questionsWithRounds;
    }
}
