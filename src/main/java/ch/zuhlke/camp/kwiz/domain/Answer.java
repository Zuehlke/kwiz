package ch.zuhlke.camp.kwiz.domain;

import java.util.Objects;

/**
 * Answer is a value object that represents a player's answer to a question.
 */
public class Answer {
    private final String questionId;
    private final String text;
    private boolean correct;

    public Answer(String questionId, String text) {
        this.questionId = questionId;
        this.text = text;
        this.correct = false; // By default, answers are not marked as correct
    }

    public String getQuestionId() {
        return questionId;
    }

    public String getText() {
        return text;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void markAsCorrect() {
        this.correct = true;
    }

    public void markAsIncorrect() {
        this.correct = false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Answer answer = (Answer) o;
        return Objects.equals(questionId, answer.questionId) &&
               Objects.equals(text, answer.text);
    }

    @Override
    public int hashCode() {
        return Objects.hash(questionId, text);
    }
}
