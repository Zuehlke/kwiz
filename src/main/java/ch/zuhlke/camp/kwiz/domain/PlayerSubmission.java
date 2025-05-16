package ch.zuhlke.camp.kwiz.domain;

import java.time.Instant;
import java.util.Objects;

/**
 * PlayerSubmission is a value object that represents an answer submitted by a player
 * for a specific question in a game. It contains information about the submission,
 * including whether it is correct.
 */
public class PlayerSubmission {
    private final String playerId;
    private final String questionId;
    private final String submittedAnswerText;
    private final long submittedAtTimestamp;
    private final boolean isCorrect;

    /**
     * Creates a new PlayerSubmission with the given details.
     *
     * @param playerId           the ID of the player who submitted the answer
     * @param questionId         the ID of the question being answered
     * @param submittedAnswerText the text of the submitted answer
     * @param isCorrect          whether the answer is correct
     */
    public PlayerSubmission(String playerId, String questionId, String submittedAnswerText, boolean isCorrect) {
        this.playerId = playerId;
        this.questionId = questionId;
        this.submittedAnswerText = submittedAnswerText;
        this.submittedAtTimestamp = Instant.now().toEpochMilli();
        this.isCorrect = isCorrect;
    }

    /**
     * Creates a new PlayerSubmission with the given details, including a specific timestamp.
     *
     * @param playerId           the ID of the player who submitted the answer
     * @param questionId         the ID of the question being answered
     * @param submittedAnswerText the text of the submitted answer
     * @param submittedAtTimestamp the timestamp when the answer was submitted
     * @param isCorrect          whether the answer is correct
     */
    public PlayerSubmission(String playerId, String questionId, String submittedAnswerText, 
                           long submittedAtTimestamp, boolean isCorrect) {
        this.playerId = playerId;
        this.questionId = questionId;
        this.submittedAnswerText = submittedAnswerText;
        this.submittedAtTimestamp = submittedAtTimestamp;
        this.isCorrect = isCorrect;
    }

    /**
     * Returns the ID of the player who submitted the answer.
     *
     * @return the player ID
     */
    public String getPlayerId() {
        return playerId;
    }

    /**
     * Returns the ID of the question being answered.
     *
     * @return the question ID
     */
    public String getQuestionId() {
        return questionId;
    }

    /**
     * Returns the text of the submitted answer.
     *
     * @return the submitted answer text
     */
    public String getSubmittedAnswerText() {
        return submittedAnswerText;
    }

    /**
     * Returns the timestamp when the answer was submitted.
     *
     * @return the submission timestamp
     */
    public long getSubmittedAtTimestamp() {
        return submittedAtTimestamp;
    }

    /**
     * Returns whether the answer is correct.
     *
     * @return true if the answer is correct, false otherwise
     */
    public boolean isCorrect() {
        return isCorrect;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlayerSubmission that = (PlayerSubmission) o;
        return submittedAtTimestamp == that.submittedAtTimestamp &&
               isCorrect == that.isCorrect &&
               Objects.equals(playerId, that.playerId) &&
               Objects.equals(questionId, that.questionId) &&
               Objects.equals(submittedAnswerText, that.submittedAnswerText);
    }

    @Override
    public int hashCode() {
        return Objects.hash(playerId, questionId, submittedAnswerText, submittedAtTimestamp, isCorrect);
    }
}