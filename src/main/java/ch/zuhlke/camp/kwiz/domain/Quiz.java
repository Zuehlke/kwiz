package ch.zuhlke.camp.kwiz.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Quiz is an aggregate root in our domain model.
 * It represents a quiz with its questions, rounds, and participating teams.
 */
public class Quiz {
    private final String id;
    private final String name;
    private final int maxTeams;
    private final List<Team> teams;
    private final List<Round> rounds;
    private boolean started;
    private boolean ended;

    public Quiz(String id, String name, int maxTeams) {
        this.id = id;
        this.name = name;
        this.maxTeams = maxTeams;
        this.teams = new ArrayList<>();
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

    public int getMaxTeams() {
        return maxTeams;
    }

    public List<Team> getTeams() {
        return Collections.unmodifiableList(teams);
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

    public void addTeam(Team team) {
        if (isStarted()) {
            throw new IllegalStateException("Cannot add team after quiz has started");
        }
        
        if (teams.size() >= maxTeams) {
            throw new IllegalStateException("Maximum number of teams reached");
        }
        
        if (teams.stream().anyMatch(t -> t.getName().equals(team.getName()))) {
            throw new IllegalArgumentException("Team name must be unique");
        }
        
        teams.add(team);
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
        
        if (teams.isEmpty()) {
            throw new IllegalStateException("Cannot start quiz without teams");
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