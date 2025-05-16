package ch.zuhlke.camp.kwiz.infrastructure;

import ch.zuhlke.camp.kwiz.application.GameOrchestrationService;
import ch.zuhlke.camp.kwiz.domain.Game;
import ch.zuhlke.camp.kwiz.domain.GameStatus;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * GameTimerScheduler is responsible for managing the timers for active games.
 * It periodically calls the handleGameTick method in the GameOrchestrationService
 * for each active game.
 */
@Component
@EnableScheduling
public class GameTimerScheduler {
    private final GameOrchestrationService gameOrchestrationService;
    private final InMemoryGameRepository gameRepository;
    
    // Map to track which games have active timers
    private final ConcurrentMap<String, Boolean> activeGameTimers = new ConcurrentHashMap<>();

    public GameTimerScheduler(GameOrchestrationService gameOrchestrationService, InMemoryGameRepository gameRepository) {
        this.gameOrchestrationService = gameOrchestrationService;
        this.gameRepository = gameRepository;
    }

    /**
     * Registers a game for timer updates.
     *
     * @param gameId the ID of the game to register
     */
    public void registerGame(String gameId) {
        activeGameTimers.put(gameId, true);
    }

    /**
     * Unregisters a game from timer updates.
     *
     * @param gameId the ID of the game to unregister
     */
    public void unregisterGame(String gameId) {
        activeGameTimers.remove(gameId);
    }

    /**
     * Scheduled task that runs every second to update the timers for all active games.
     * This method is called automatically by Spring's scheduling mechanism.
     */
    @Scheduled(fixedRate = 1000) // Run every 1000 milliseconds (1 second)
    public void updateGameTimers() {
        // Process all registered games
        for (String gameId : activeGameTimers.keySet()) {
            try {
                // Get the game from the repository
                gameRepository.findById(gameId).ifPresent(game -> {
                    // Only process games with active questions
                    if (game.getStatus() == GameStatus.QUESTION_ACTIVE) {
                        // Call the handleGameTick method in the GameOrchestrationService
                        gameOrchestrationService.handleGameTick(gameId);
                        
                        // If the game is no longer active, unregister it
                        if (game.getStatus() == GameStatus.GAME_OVER) {
                            unregisterGame(gameId);
                        }
                    }
                });
            } catch (Exception e) {
                // Log the error but continue processing other games
                System.err.println("Error updating timer for game " + gameId + ": " + e.getMessage());
            }
        }
    }
    
    /**
     * Scans the repository for active games and registers them for timer updates.
     * This method can be called during application startup to ensure that all active games
     * are properly registered.
     */
    public void scanAndRegisterActiveGames() {
        List<Game> allGames = gameRepository.findAll();
        for (Game game : allGames) {
            if (game.getStatus() == GameStatus.QUESTION_ACTIVE) {
                registerGame(game.getId());
            }
        }
    }
}