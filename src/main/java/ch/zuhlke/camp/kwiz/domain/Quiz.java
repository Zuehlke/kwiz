package ch.zuhlke.camp.kwiz.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Quiz is an aggregate root in our domain model.
 * It represents a quiz with its questions, rounds, and participating participants.
 */
public class Quiz {
    private final String id;
    private final String name;
    private final int maxParticipants;
    private final List<Participant> participants;
    private final List<Round> rounds;
    private boolean started;
    private boolean ended;

    public Quiz(String id, String name, int maxParticipants) {
        this.id = id;
        this.name = name;
        this.maxParticipants = maxParticipants;
        this.participants = new ArrayList<>();
        this.rounds = new ArrayList<>();
        this.started = false;
        this.ended = false;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getMaxParticipants() {
        return maxParticipants;
    }

    public List<Participant> getParticipants() {
        return Collections.unmodifiableList(participants);
    }

    public List<Round> getRounds() {
        return Collections.unmodifiableList(rounds);
    }

    public boolean isStarted() {
        return started;
    }

    public boolean isEnded() {
        return ended;
    }

    public void addParticipant(Participant participant) {
        if (isStarted()) {
            throw new IllegalStateException("Cannot add participant after quiz has started");
        }

        if (participants.size() >= maxParticipants) {
            throw new IllegalStateException("Maximum number of participants reached");
        }

        if (participants.stream().anyMatch(p -> p.getName().equals(participant.getName()))) {
            throw new IllegalArgumentException("Participant name must be unique");
        }

        participants.add(participant);
    }

    public void addRound(Round round) {
        if (isStarted()) {
            throw new IllegalStateException("Cannot add round after quiz has started");
        }
        rounds.add(round);
    }

    public void start() {
        if (rounds.isEmpty()) {
            throw new IllegalStateException("Cannot start quiz without rounds");
        }

        if (participants.isEmpty()) {
            throw new IllegalStateException("Cannot start quiz without participants");
        }

        this.started = true;
    }

    public void end() {
        if (!isStarted()) {
            throw new IllegalStateException("Cannot end quiz that hasn't started");
        }

        this.ended = true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Quiz quiz = (Quiz) o;
        return Objects.equals(id, quiz.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
