package ch.zuhlke.camp.kwiz.infrastructure;

import ch.zuhlke.camp.kwiz.application.GameOrchestrationService;
import ch.zuhlke.camp.kwiz.domain.Game;
import ch.zuhlke.camp.kwiz.domain.GameEngine;
import ch.zuhlke.camp.kwiz.domain.Quiz;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Custom actuator endpoint to expose the game state.
 * This endpoint provides information about all quizzes, rounds, questions, and players.
 */
@Component
@Endpoint(id = "gamestate")
public class GameStateEndpoint {

    private final InMemoryGameRepository gameRepository;
    private final GameEngine gameEngine;

    public GameStateEndpoint(InMemoryGameRepository gameRepository, GameEngine gameEngine) {
        this.gameRepository = gameRepository;
        this.gameEngine = gameEngine;
    }

    /**
     * Provides a comprehensive view of the application state including all quizzes,
     * rounds, questions, and players.
     *
     * @return A map containing the application state
     */
    @ReadOperation
    public Map<String, Object> gameState() {
        Map<String, Object> state = new HashMap<>();
        
        // Get all quizzes
        List<Quiz> quizzes = gameEngine.getQuizzes();
        List<Map<String, Object>> quizzesList = quizzes.stream()
                .map(this::mapQuizToDto)
                .collect(Collectors.toList());
        state.put("quizzes", quizzesList);
        
        // Get all active games
        List<Game> games = gameRepository.findAll();
        List<Map<String, Object>> gamesList = games.stream()
                .map(this::mapGameToDto)
                .collect(Collectors.toList());
        state.put("games", gamesList);
        
        return state;
    }
    
    private Map<String, Object> mapQuizToDto(Quiz quiz) {
        Map<String, Object> quizDto = new HashMap<>();
        quizDto.put("id", quiz.getId());
        quizDto.put("name", quiz.getName());
        quizDto.put("maxPlayers", quiz.getMaxPlayers());
        quizDto.put("started", quiz.isStarted());
        quizDto.put("ended", quiz.isEnded());
        
        // Map players
        List<Map<String, Object>> playersList = quiz.getPlayers().stream()
                .map(player -> {
                    Map<String, Object> playerDto = new HashMap<>();
                    playerDto.put("id", player.getId());
                    playerDto.put("name", player.getName());
                    return playerDto;
                })
                .collect(Collectors.toList());
        quizDto.put("players", playersList);
        
        // Map rounds
        List<Map<String, Object>> roundsList = quiz.getRounds().stream()
                .map(round -> {
                    Map<String, Object> roundDto = new HashMap<>();
                    roundDto.put("id", round.getId());
                    roundDto.put("name", round.getName());
                    roundDto.put("active", round.isActive());
                    roundDto.put("completed", round.isCompleted());
                    
                    // Map questions
                    List<Map<String, Object>> questionsList = round.getQuestions().stream()
                            .map(question -> {
                                Map<String, Object> questionDto = new HashMap<>();
                                questionDto.put("id", question.getId());
                                questionDto.put("text", question.getText());
                                questionDto.put("timeLimit", question.getTimeLimit());
                                return questionDto;
                            })
                            .collect(Collectors.toList());
                    roundDto.put("questions", questionsList);
                    
                    return roundDto;
                })
                .collect(Collectors.toList());
        quizDto.put("rounds", roundsList);
        
        return quizDto;
    }
    
    private Map<String, Object> mapGameToDto(Game game) {
        Map<String, Object> gameDto = new HashMap<>();
        gameDto.put("id", game.getId());
        gameDto.put("quizDefinitionId", game.getQuizDefinitionId());
        gameDto.put("adminId", game.getAdminId());
        gameDto.put("status", game.getStatus());
        gameDto.put("currentRoundIndex", game.getCurrentRoundIndex());
        gameDto.put("currentQuestionIndex", game.getCurrentQuestionIndex());
        gameDto.put("currentQuestionRemainingSeconds", game.getCurrentQuestionRemainingSeconds());
        gameDto.put("acceptingAnswers", game.isAcceptingAnswers());
        
        // Map players
        List<Map<String, Object>> playersList = game.getPlayers().values().stream()
                .map(player -> {
                    Map<String, Object> playerDto = new HashMap<>();
                    playerDto.put("playerId", player.getPlayerId());
                    playerDto.put("displayName", player.getDisplayName());
                    playerDto.put("score", player.getScore());
                    return playerDto;
                })
                .collect(Collectors.toList());
        gameDto.put("players", playersList);
        
        // Map rounds
        List<Map<String, Object>> roundsList = game.getRounds().stream()
                .map(round -> {
                    Map<String, Object> roundDto = new HashMap<>();
                    roundDto.put("id", round.getId());
                    roundDto.put("name", round.getName());
                    roundDto.put("active", round.isActive());
                    roundDto.put("completed", round.isCompleted());
                    
                    // Map questions
                    List<Map<String, Object>> questionsList = round.getQuestions().stream()
                            .map(question -> {
                                Map<String, Object> questionDto = new HashMap<>();
                                questionDto.put("id", question.getId());
                                questionDto.put("text", question.getText());
                                questionDto.put("timeLimit", question.getTimeLimit());
                                return questionDto;
                            })
                            .collect(Collectors.toList());
                    roundDto.put("questions", questionsList);
                    
                    return roundDto;
                })
                .collect(Collectors.toList());
        gameDto.put("rounds", roundsList);
        
        return gameDto;
    }
}