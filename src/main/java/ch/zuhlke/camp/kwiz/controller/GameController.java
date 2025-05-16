package ch.zuhlke.camp.kwiz.controller;

import ch.zuhlke.camp.kwiz.application.GameOrchestrationService;
import ch.zuhlke.camp.kwiz.application.GameOrchestrationService.GameStateDTO;
import ch.zuhlke.camp.kwiz.domain.Quiz;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for game-related operations.
 */
@RestController
@RequestMapping("/api/games")
public class GameController {
    private final GameOrchestrationService gameOrchestrationService;

    public GameController(GameOrchestrationService gameOrchestrationService) {
        this.gameOrchestrationService = gameOrchestrationService;
    }


    /**
     * Returns the current state of a game.
     *
     * @param gameId the ID of the game
     * @return the game state
     */
    @GetMapping("/{gameId}")
    public ResponseEntity<GameStateDTO> getGameState(@PathVariable String gameId) {
        GameStateDTO gameState = gameOrchestrationService.getGameSnapshot(gameId);
        return ResponseEntity.ok(gameState);
    }

    /**
     * Submits a player's answer for a question in a game.
     *
     * @param gameId the ID of the game
     * @param playerId the ID of the player submitting the answer
     * @param questionId the ID of the question being answered
     * @param answerText the text of the answer
     * @return a success message
     */
    @PostMapping("/{gameId}/answers")
    public ResponseEntity<String> submitAnswer(
            @PathVariable String gameId,
            @RequestParam String playerId,
            @RequestParam String questionId,
            @RequestParam String answerText) {
        gameOrchestrationService.submitPlayerAnswer(gameId, playerId, questionId, answerText);
        return ResponseEntity.ok("Answer submitted successfully");
    }

    /**
     * Allows an admin to manually close the current question.
     *
     * @param gameId the ID of the game
     * @param adminId the ID of the admin
     * @return a success message
     */
    @PostMapping("/{gameId}/close-question")
    public ResponseEntity<String> closeCurrentQuestion(
            @PathVariable String gameId,
            @RequestParam String adminId) {
        gameOrchestrationService.adminCloseCurrentQuestion(gameId, adminId);
        return ResponseEntity.ok("Question closed successfully");
    }

    /**
     * Allows an admin to proceed to the next question or round.
     *
     * @param gameId the ID of the game
     * @param adminId the ID of the admin
     * @return a success message
     */
    @PostMapping("/{gameId}/next-question")
    public ResponseEntity<String> advanceToNextQuestion(
            @PathVariable String gameId,
            @RequestParam String adminId) {
        gameOrchestrationService.adminAdvanceToNextQuestion(gameId, adminId);
        return ResponseEntity.ok("Advanced to next question successfully");
    }

    /**
     * Allows an admin to start the next round after a round has been completed.
     *
     * @param gameId the ID of the game
     * @param adminId the ID of the admin
     * @return a success message
     */
    @PostMapping("/{gameId}/next-round")
    public ResponseEntity<String> startNextRound(
            @PathVariable String gameId,
            @RequestParam String adminId) {
        gameOrchestrationService.adminStartNextRound(gameId, adminId);
        return ResponseEntity.ok("Started next round successfully");
    }
}
