package ch.zuhlke.camp.kwiz.infrastructure;

import ch.zuhlke.camp.kwiz.domain.Game;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * InMemoryGameRepository is a repository implementation that stores Game aggregates in memory.
 * It provides methods to save, find, and delete games.
 */
@Repository
public class InMemoryGameRepository {
    private final Map<String, Game> games = new ConcurrentHashMap<>();

    /**
     * Saves a game to the repository.
     * If a game with the same ID already exists, it will be replaced.
     *
     * @param game the game to save
     * @return the saved game
     */
    public Game save(Game game) {
        games.put(game.getId(), game);
        return game;
    }

    /**
     * Finds a game by its ID.
     *
     * @param gameId the ID of the game to find
     * @return an Optional containing the game if found, or an empty Optional if not found
     */
    public Optional<Game> findById(String gameId) {
        return Optional.ofNullable(games.get(gameId));
    }

    /**
     * Returns all games in the repository.
     *
     * @return an unmodifiable list of all games
     */
    public List<Game> findAll() {
        return Collections.unmodifiableList(new ArrayList<>(games.values()));
    }

    /**
     * Deletes a game from the repository.
     *
     * @param gameId the ID of the game to delete
     */
    public void deleteById(String gameId) {
        games.remove(gameId);
    }

    /**
     * Deletes all games from the repository.
     */
    public void deleteAll() {
        games.clear();
    }

    /**
     * Returns the number of games in the repository.
     *
     * @return the number of games
     */
    public int count() {
        return games.size();
    }
}