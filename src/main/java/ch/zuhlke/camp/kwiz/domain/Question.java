package ch.zuhlke.camp.kwiz.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Question is an entity that represents a question in a quiz.
 */
public class Question {
    private final String id;
    private final String text;
    private final List<String> correctAnswers;
    private final int timeLimit; // in seconds

    public Question(String text, List<String> correctAnswers, int timeLimit) {
        this.id = UUID.randomUUID().toString();
        this.text = text;
        this.correctAnswers = new ArrayList<>(correctAnswers);
        this.timeLimit = timeLimit;
    }

    public String getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public List<String> getCorrectAnswers() {
        return Collections.unmodifiableList(correctAnswers);
    }

    public int getTimeLimit() {
        return timeLimit;
    }

    public boolean isCorrectAnswer(String answer) {
        return correctAnswers.stream()
                .anyMatch(correctAnswer -> correctAnswer.equalsIgnoreCase(answer.trim()));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Question question = (Question) o;
        return Objects.equals(id, question.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}