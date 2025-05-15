package ch.zuhlke.camp.kwiz.domain;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Player is an entity that represents a player in a quiz.
 * It contains the player's name and their answers to questions.
 */
public class Player {
    private final String id;
    private final String name;
    private final Map<String, Answer> answers; // questionId -> Answer

    public Player(String name) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.answers = new HashMap<>();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void submitAnswer(String questionId, String answerText) {
        Answer answer = new Answer(questionId, answerText);
        answers.put(questionId, answer);
    }

    public Answer getAnswerForQuestion(String questionId) {
        return answers.get(questionId);
    }

    public boolean hasAnsweredQuestion(String questionId) {
        return answers.containsKey(questionId);
    }

    public int getScore() {
        return (int) answers.values().stream()
                .filter(Answer::isCorrect)
                .count();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Player player = (Player) o;
        return Objects.equals(id, player.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}