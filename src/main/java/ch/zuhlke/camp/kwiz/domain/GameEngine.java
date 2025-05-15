package ch.zuhlke.camp.kwiz.domain;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * GameEngine is the main class that manages the game state.
 * It is responsible for creating and retrieving quizzes, adding teams to quizzes,
 * and managing the quiz lifecycle.
 */
@Component
public class GameEngine {
    private final Map<String, Quiz> quizzes;

    public GameEngine() {
        this.quizzes = new ConcurrentHashMap<>();
    }

    /**
     * Creates a new quiz with the given ID, name, and maximum number of teams.
     *
     * @param quizId    the unique ID of the quiz
     * @param quizName  the name of the quiz
     * @param maxTeams  the maximum number of teams allowed in the quiz
     * @return the created quiz
     */
    public Quiz createQuiz(String quizId, String quizName, int maxTeams) {
        Quiz quiz = new Quiz(quizId, quizName, maxTeams);
        quizzes.put(quizId, quiz);
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
     * Adds a team to a quiz.
     *
     * @param quizId   the ID of the quiz to add the team to
     * @param teamName the name of the team to add
     * @return the created team
     * @throws IllegalArgumentException if no quiz with the given ID exists
     * @throws IllegalStateException    if the quiz has already started
     */
    public Team addTeamToQuiz(String quizId, String teamName) {
        Quiz quiz = getQuizById(quizId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizId);
        }

        if (quiz.isStarted()) {
            throw new IllegalStateException("Cannot add team to a quiz that has already started");
        }

        Team team = new Team(teamName);
        quiz.addTeam(team);
        return team;
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
     * Submits an answer for a team.
     *
     * @param quizId     the ID of the quiz
     * @param teamId     the ID of the team submitting the answer
     * @param questionId the ID of the question being answered
     * @param answerText the text of the answer
     * @throws IllegalArgumentException if no quiz with the given ID exists, no team with the given ID exists, or no question with the given ID exists
     * @throws IllegalStateException    if the quiz has not started or has ended
     */
    public void submitAnswer(String quizId, String teamId, String questionId, String answerText) {
        Quiz quiz = getQuizById(quizId);
        if (quiz == null) {
            throw new IllegalArgumentException("No quiz found with ID: " + quizId);
        }

        if (!quiz.isStarted() || quiz.isEnded()) {
            throw new IllegalStateException("Cannot submit answer to a quiz that has not started or has ended");
        }

        Team team = quiz.getTeams().stream()
                .filter(t -> t.getId().equals(teamId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No team found with ID: " + teamId));

        // Find the question to check if the answer is correct
        Question question = quiz.getRounds().stream()
                .flatMap(round -> round.getQuestions().stream())
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No question found with ID: " + questionId));

        team.submitAnswer(questionId, answerText);
        
        // Mark the answer as correct if it matches any of the correct answers
        if (question.isCorrectAnswer(answerText)) {
            Answer answer = team.getAnswerForQuestion(questionId);
            answer.markAsCorrect();
        }
    }
}