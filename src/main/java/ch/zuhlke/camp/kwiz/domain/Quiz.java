package ch.zuhlke.camp.kwiz.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Quiz is an aggregate root in our domain model.
 * It represents a quiz with its questions, rounds, and participating players.
 */
public class Quiz {
    private final String id;
    private final String name;
    private final int maxPlayers;
    private final List<Player> players;
    private final List<Round> rounds;
    private boolean started;
    private boolean ended;
    private String currentGameId;

    public Quiz(String id, String name, int maxPlayers) {
        this(id, name, maxPlayers, true);
    }

    /**
     * Creates a new Quiz instance.
     *
     * @param id the unique ID of the quiz
     * @param name the name of the quiz
     * @param maxPlayers the maximum number of players allowed in the quiz
     * @param addDefaults whether to add default round, question, and player
     */
    public Quiz(String id, String name, int maxPlayers, boolean addDefaults) {
        this.id = id;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.players = new ArrayList<>();
        this.rounds = new ArrayList<>();
        this.started = false;
        this.ended = false;
        this.currentGameId = null;

        if (addDefaults) {
            // First default round
            Round round = new Round("Round 1");

            // Just a dummy question and player for easier testing
            round.addQuestion(new Question("What game did Christian Moser’s 9 year old son implement using AI? Is it Snake, Minecraft, Tetris or Pub Quiz?", Collections.singletonList("Minecraft"), 30));
            this.addPlayer(new Player("Junie"));
            this.addRound(round);
        }
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public List<Player> getPlayers() {
        return Collections.unmodifiableList(players);
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

    public String getCurrentGameId() {
        return currentGameId;
    }

    public void setCurrentGameId(String currentGameId) {
        this.currentGameId = currentGameId;
    }


    public void addPlayer(Player player) {
        if (isStarted()) {
            throw new IllegalStateException("Cannot add player after quiz has started");
        }

        if (players.size() >= maxPlayers) {
            throw new IllegalStateException("Maximum number of players reached");
        }

        if (players.stream().anyMatch(p -> p.getName().equals(player.getName()))) {
            throw new IllegalArgumentException("Player name must be unique");
        }

        players.add(player);
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

        if (players.isEmpty()) {
            throw new IllegalStateException("Cannot start quiz without players");
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
