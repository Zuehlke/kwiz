package ch.zuhlke.camp.kwiz.controller;

import ch.zuhlke.camp.kwiz.domain.GameEngine;
import ch.zuhlke.camp.kwiz.domain.Participant;
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
            description = "Creates a new quiz with the specified name and maximum number of participants",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Quiz created successfully")
            }
    )
    @PostMapping
    public ResponseEntity<Map<String, Object>> createQuiz(@RequestBody CreateQuizRequest request) {
        Quiz quiz = gameEngine.createQuiz(request.getQuizId(), request.getQuizName(), request.getMaxParticipants());

        Map<String, Object> response = new HashMap<>();
        response.put("quizId", quiz.getId());
        response.put("quizName", quiz.getName());
        response.put("maxParticipants", quiz.getMaxParticipants());

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
        response.put("maxParticipants", quiz.getMaxParticipants());
        response.put("started", quiz.isStarted());
        response.put("ended", quiz.isEnded());
        response.put("participantCount", quiz.getParticipants().size());

        return ResponseEntity.ok(response);
    }

    /**
     * Adds a participant to a quiz.
     *
     * @param quizId the ID of the quiz to add the participant to
     * @param request the request containing participant details
     * @return the added participant
     */
    @Operation(
            summary = "Join a quiz",
            description = "Adds a participant to the quiz with the specified ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Participant added successfully"),
                    @ApiResponse(responseCode = "404", description = "Quiz not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid request"),
                    @ApiResponse(responseCode = "409", description = "Quiz has already started or maximum number of participants reached")
            }
    )
    @PostMapping("/{quizId}/participants")
    public ResponseEntity<Map<String, Object>> joinQuiz(
            @PathVariable String quizId,
            @RequestBody JoinQuizRequest request) {
        try {
            Participant participant = gameEngine.addParticipantToQuiz(quizId, request.getParticipantName());

            Map<String, Object> response = new HashMap<>();
            response.put("quizId", quizId);
            response.put("participantId", participant.getId());
            response.put("participantName", participant.getName());
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
        private int maxParticipants;

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

        public int getMaxParticipants() {
            return maxParticipants;
        }

        public void setMaxParticipants(int maxParticipants) {
            this.maxParticipants = maxParticipants;
        }
    }

    /**
     * Request object for joining a quiz.
     */
    public static class JoinQuizRequest {
        private String participantName;

        public String getParticipantName() {
            return participantName;
        }

        public void setParticipantName(String participantName) {
            this.participantName = participantName;
        }
    }
}
