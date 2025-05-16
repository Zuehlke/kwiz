package ch.zuhlke.camp.kwiz.domain;

import java.util.Objects;

/**
 * PlayerInGame is an entity that represents a player's state within a specific game.
 * It is part of the Game aggregate and contains the player's basic information and score.
 */
public class PlayerInGame {
    private final String playerId;
    private final String displayName;
    private int score;

    /**
     * Creates a new PlayerInGame with the given player ID and display name.
     * The initial score is set to 0.
     *
     * @param playerId    the ID of the player
     * @param displayName the display name of the player
     */
    public PlayerInGame(String playerId, String displayName) {
        this.playerId = playerId;
        this.displayName = displayName;
        this.score = 0;
    }

    /**
     * Returns the ID of the player.
     *
     * @return the player ID
     */
    public String getPlayerId() {
        return playerId;
    }

    /**
     * Returns the display name of the player.
     *
     * @return the display name
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Returns the current score of the player.
     *
     * @return the score
     */
    public int getScore() {
        return score;
    }

    /**
     * Increases the player's score by the specified amount.
     *
     * @param points the number of points to add to the score
     */
    public void addPoints(int points) {
        this.score += points;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlayerInGame that = (PlayerInGame) o;
        return Objects.equals(playerId, that.playerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(playerId);
    }
}