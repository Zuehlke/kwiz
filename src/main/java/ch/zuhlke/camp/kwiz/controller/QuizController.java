package ch.zuhlke.camp.kwiz.controller;

import ch.zuhlke.camp.kwiz.domain.GameEngine;
import ch.zuhlke.camp.kwiz.domain.Player;
import ch.zuhlke.camp.kwiz.domain.Question;
import ch.zuhlke.camp.kwiz.domain.Quiz;
import ch.zuhlke.camp.kwiz.domain.Round;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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
     * Starts a quiz.
     *
     * @param quizId the ID of the quiz to start
     * @return the started quiz
     */
    @Operation(
            summary = "Start a quiz",
            description = "Starts the quiz with the specified ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Quiz started successfully"),
                    @ApiResponse(responseCode = "404", description = "Quiz not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid request")
            }
    )
    @PostMapping("/{quizId}/start")
    public ResponseEntity<Map<String, Object>> startQuiz(@PathVariable String quizId) {
        try {
            gameEngine.startQuiz(quizId);

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
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Creates a new round in a quiz.
     *
     * @param quizId the ID of the quiz to add the round to
     * @param request the request containing round details
     * @return the created round
     */
    @Operation(
            summary = "Create a new round",
            description = "Creates a new round in the quiz with the specified ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Round created successfully"),
                    @ApiResponse(responseCode = "404", description = "Quiz not found"),
                    @ApiResponse(responseCode = "409", description = "Quiz has already started")
            }
    )
    @PostMapping("/{quizId}/rounds")
    public ResponseEntity<Map<String, Object>> createRound(
            @PathVariable String quizId,
            @RequestBody CreateRoundRequest request) {
        try {
            Round round = gameEngine.addRoundToQuiz(quizId, request.getRoundName());

            Map<String, Object> response = new HashMap<>();
            response.put("roundId", round.getId());
            response.put("roundName", round.getName());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Gets all rounds in a quiz.
     *
     * @param quizId the ID of the quiz
     * @return a list of rounds in the quiz
     */
    @Operation(
            summary = "Get all rounds in a quiz",
            description = "Returns all rounds in the quiz with the specified ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Rounds retrieved successfully"),
                    @ApiResponse(responseCode = "404", description = "Quiz not found")
            }
    )
    @GetMapping("/{quizId}/rounds")
    public ResponseEntity<List<Map<String, Object>>> getRounds(@PathVariable String quizId) {
        try {
            Quiz quiz = gameEngine.getQuizById(quizId);
            if (quiz == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> response = quiz.getRounds().stream()
                    .map(round -> {
                        Map<String, Object> roundMap = new HashMap<>();
                        roundMap.put("roundId", round.getId());
                        roundMap.put("roundName", round.getName());
                        roundMap.put("active", round.isActive());
                        roundMap.put("completed", round.isCompleted());
                        roundMap.put("questionCount", round.getQuestions().size());
                        return roundMap;
                    })
                    .toList();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
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

    /**
     * Request object for creating a round.
     */
    public static class CreateRoundRequest {
        private String roundName;

        public String getRoundName() {
            return roundName;
        }

        public void setRoundName(String roundName) {
            this.roundName = roundName;
        }
    }

    /**
     * Allows a participant to submit a question to a quiz.
     *
     * @param quizId the ID of the quiz to add the question to
     * @param playerId the ID of the player submitting the question
     * @param request the request containing question details
     * @return the created question
     */
    @Operation(
            summary = "Submit a participant question",
            description = "Allows a participant to submit a question to a quiz. This is only allowed if the quiz has not started yet.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Question submitted successfully"),
                    @ApiResponse(responseCode = "404", description = "Quiz or player not found"),
                    @ApiResponse(responseCode = "409", description = "Quiz has already started")
            }
    )
    @PostMapping("/{quizId}/players/{playerId}/questions")
    public ResponseEntity<Map<String, Object>> submitParticipantQuestion(
            @PathVariable String quizId,
            @PathVariable String playerId,
            @RequestBody SubmitQuestionRequest request) {
        try {
            // If roundId is provided, add the question to that round
            // Otherwise, use the default behavior (add to "Participant Questions" round)
            Question question;
            if (request.getRoundId() != null && !request.getRoundId().isEmpty()) {
                question = gameEngine.addQuestionToRound(
                        quizId,
                        request.getRoundId(),
                        request.getQuestionText(),
                        request.getCorrectAnswers(),
                        request.getTimeLimit()
                );
                // Set the submitter ID manually since addQuestionToRound doesn't do it
                // This is a workaround until we update the GameEngine method
                question = new Question(
                        question.getText(),
                        question.getCorrectAnswers(),
                        question.getTimeLimit(),
                        playerId
                );
            } else {
                question = gameEngine.submitParticipantQuestion(
                        quizId,
                        playerId,
                        request.getQuestionText(),
                        request.getCorrectAnswers(),
                        request.getTimeLimit()
                );
            }

            Map<String, Object> response = new HashMap<>();
            response.put("questionId", question.getId());
            response.put("questionText", question.getText());
            response.put("correctAnswers", question.getCorrectAnswers());
            response.put("timeLimit", question.getTimeLimit());
            if (request.getRoundId() != null) {
                response.put("roundId", request.getRoundId());
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Gets all questions submitted by a specific player in a quiz.
     *
     * @param quizId the ID of the quiz
     * @param playerId the ID of the player
     * @return a list of questions submitted by the player
     */
    @Operation(
            summary = "Get player's submitted questions",
            description = "Retrieves all questions submitted by a specific player in a quiz.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Questions retrieved successfully"),
                    @ApiResponse(responseCode = "404", description = "Quiz or player not found")
            }
    )
    @GetMapping("/{quizId}/players/{playerId}/questions")
    public ResponseEntity<List<Map<String, Object>>> getPlayerSubmittedQuestions(
            @PathVariable String quizId,
            @PathVariable String playerId) {
        try {
            List<Question> questions = gameEngine.getQuestionsSubmittedByPlayer(quizId, playerId);

            List<Map<String, Object>> response = questions.stream()
                    .map(question -> {
                        Map<String, Object> questionMap = new HashMap<>();
                        questionMap.put("questionId", question.getId());
                        questionMap.put("questionText", question.getText());
                        questionMap.put("correctAnswers", question.getCorrectAnswers());
                        questionMap.put("timeLimit", question.getTimeLimit());
                        return questionMap;
                    })
                    .toList();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Request object for submitting a question.
     */
    public static class SubmitQuestionRequest {
        private String questionText;
        private List<String> correctAnswers;
        private int timeLimit;
        private String roundId;

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public List<String> getCorrectAnswers() {
            return correctAnswers;
        }

        public void setCorrectAnswers(List<String> correctAnswers) {
            this.correctAnswers = correctAnswers;
        }

        public int getTimeLimit() {
            return timeLimit;
        }

        public void setTimeLimit(int timeLimit) {
            this.timeLimit = timeLimit;
        }

        public String getRoundId() {
            return roundId;
        }

        public void setRoundId(String roundId) {
            this.roundId = roundId;
        }
    }
}
