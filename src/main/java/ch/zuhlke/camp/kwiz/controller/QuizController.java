package ch.zuhlke.camp.kwiz.controller;

import ch.zuhlke.camp.kwiz.domain.GameEngine;
import ch.zuhlke.camp.kwiz.domain.Player;
import ch.zuhlke.camp.kwiz.domain.Quiz;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for quiz-related operations.
 */
@RestController
@RequestMapping("/api/quizzes")
@Tag(name = "Quizzes", description = "Quiz management endpoints")
public class QuizController {

    private final GameEngine gameEngine;

    public QuizController(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
    }

    /**
     * Creates a new quiz.
     *
     * @param request the request containing quiz details
     * @return the created quiz
     */
    @Operation(
            summary = "Create a new quiz",
            description = "Creates a new quiz with the specified name and maximum number of players",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Quiz created successfully")
            }
    )
    @PostMapping
    public ResponseEntity<Map<String, Object>> createQuiz(@RequestBody CreateQuizRequest request) {
        Quiz quiz = gameEngine.createQuiz(request.getQuizId(), request.getQuizName(), request.getMaxPlayers());

        Map<String, Object> response = new HashMap<>();
        response.put("quizId", quiz.getId());
        response.put("quizName", quiz.getName());
        response.put("maxPlayers", quiz.getMaxPlayers());

        return ResponseEntity.ok(response);
    }

    /**
     * Gets a quiz by ID.
     *
     * @param quizId the ID of the quiz to get
     * @return the quiz with the specified ID
     */
    @Operation(
            summary = "Get a quiz by ID",
            description = "Returns the quiz with the specified ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Quiz found"),
                    @ApiResponse(responseCode = "404", description = "Quiz not found")
            }
    )
    @GetMapping("/{quizId}")
    public ResponseEntity<Map<String, Object>> getQuiz(@PathVariable String quizId) {
        Quiz quiz = gameEngine.getQuizById(quizId);

        if (quiz == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("quizId", quiz.getId());
        response.put("quizName", quiz.getName());
        response.put("maxPlayers", quiz.getMaxPlayers());
        response.put("started", quiz.isStarted());
        response.put("ended", quiz.isEnded());
        response.put("playerCount", quiz.getPlayers().size());

        return ResponseEntity.ok(response);
    }

    /**
     * Adds a player to a quiz.
     *
     * @param quizId the ID of the quiz to add the player to
     * @param request the request containing player details
     * @return the added player
     */
    @Operation(
            summary = "Join a quiz",
            description = "Adds a player to the quiz with the specified ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Player added successfully"),
                    @ApiResponse(responseCode = "404", description = "Quiz not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid request"),
                    @ApiResponse(responseCode = "409", description = "Quiz has already started or maximum number of players reached")
            }
    )
    @PostMapping("/{quizId}/players")
    public ResponseEntity<Map<String, Object>> joinQuiz(
            @PathVariable String quizId,
            @RequestBody JoinQuizRequest request) {
        try {
            Player player = gameEngine.addPlayerToQuiz(quizId, request.getPlayerName());

            Map<String, Object> response = new HashMap<>();
            response.put("quizId", quizId);
            response.put("playerId", player.getId());
            response.put("playerName", player.getName());
            response.put("redirectUrl", "/waiting-room/" + quizId);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Request object for creating a quiz.
     */
    public static class CreateQuizRequest {
        private String quizId;
        private String quizName;
        private int maxPlayers;

        public String getQuizId() {
            return quizId;
        }

        public void setQuizId(String quizId) {
            this.quizId = quizId;
        }

        public String getQuizName() {
            return quizName;
        }

        public void setQuizName(String quizName) {
            this.quizName = quizName;
        }

        public int getMaxPlayers() {
            return maxPlayers;
        }

        public void setMaxPlayers(int maxPlayers) {
            this.maxPlayers = maxPlayers;
        }
    }

    /**
     * Request object for joining a quiz.
     */
    public static class JoinQuizRequest {
        private String playerName;

        public String getPlayerName() {
            return playerName;
        }

        public void setPlayerName(String playerName) {
            this.playerName = playerName;
        }
    }
}
