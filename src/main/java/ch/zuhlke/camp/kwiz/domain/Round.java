package ch.zuhlke.camp.kwiz.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Round is an entity that represents a round in a quiz.
 * It contains multiple questions.
 */
public class Round {
    private final String id;
    private final String name;
    private final List<Question> questions;
    private boolean active;
    private boolean completed;

    public Round(String name) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.questions = new ArrayList<>();
        this.active = false;
        this.completed = false;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<Question> getQuestions() {
        return Collections.unmodifiableList(questions);
    }

    public boolean isActive() {
        return active;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void addQuestion(Question question) {
        if (isActive() || isCompleted()) {
            throw new IllegalStateException("Cannot add questions to an active or completed round");
        }
        questions.add(question);
    }

    public void activate() {
        if (questions.isEmpty()) {
            throw new IllegalStateException("Cannot activate a round without questions");
        }
        
        if (isCompleted()) {
            throw new IllegalStateException("Cannot activate a completed round");
        }
        
        this.active = true;
    }

    public void complete() {
        if (!isActive()) {
            throw new IllegalStateException("Cannot complete a round that is not active");
        }
        
        this.active = false;
        this.completed = true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Round round = (Round) o;
        return Objects.equals(id, round.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}