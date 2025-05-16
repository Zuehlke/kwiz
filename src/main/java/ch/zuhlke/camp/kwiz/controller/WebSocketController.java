package ch.zuhlke.camp.kwiz.controller;

import ch.zuhlke.camp.kwiz.application.GameOrchestrationService.GameStateDTO;
import ch.zuhlke.camp.kwiz.domain.Player;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller for WebSocket communication.
 */
@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Sends a quiz update to all clients subscribed to the quiz topic.
     *
     * @param quizId the ID of the quiz
     * @param playerCount the current player count
     * @param maxPlayers the maximum number of players allowed
     * @param started whether the quiz has started
     * @param players the list of players in the quiz
     */
    public void sendQuizUpdate(String quizId, int playerCount, int maxPlayers, boolean started, List<Player> players, String gameId) {
        Map<String, Object> message = new HashMap<>();
        message.put("quizId", quizId);
        message.put("playerCount", playerCount);
        message.put("maxPlayers", maxPlayers);
        message.put("started", started);
        message.put("currentGameId", gameId);

        // Convert players to a list of maps with id and name
        List<Map<String, String>> playersList = players.stream()
                .map(player -> {
                    Map<String, String> playerMap = new HashMap<>();
                    playerMap.put("id", player.getId());
                    playerMap.put("name", player.getName());
                    return playerMap;
                })
                .collect(Collectors.toList());

        message.put("players", playersList);

        messagingTemplate.convertAndSend("/topic/quiz/" + quizId + "/updates", message);
    }

    /**
     * Broadcasts the current game state to all clients subscribed to the game topic.
     *
     * @param gameId the ID of the game
     * @param gameState the current state of the game
     */
    public void broadcastGameState(String gameId, GameStateDTO gameState) {
        messagingTemplate.convertAndSend("/topic/game/" + gameId + "/state", gameState);
    }

    /**
     * Sends a confirmation to a player after submitting an answer.
     *
     * @param gameId the ID of the game
     * @param playerId the ID of the player
     * @param questionId the ID of the question
     */
    public void sendPlayerAnswerConfirmation(String gameId, String playerId, String questionId) {
        Map<String, Object> message = new HashMap<>();
        message.put("gameId", gameId);
        message.put("questionId", questionId);
        message.put("status", "confirmed");

        messagingTemplate.convertAndSend("/topic/game/" + gameId + "/player/" + playerId + "/answer", message);
    }

    /**
     * Sends an error message to a player if their answer submission fails.
     *
     * @param gameId the ID of the game
     * @param playerId the ID of the player
     * @param questionId the ID of the question
     * @param errorMessage the error message
     */
    public void sendPlayerAnswerError(String gameId, String playerId, String questionId, String errorMessage) {
        Map<String, Object> message = new HashMap<>();
        message.put("gameId", gameId);
        message.put("questionId", questionId);
        message.put("status", "error");
        message.put("message", errorMessage);

        messagingTemplate.convertAndSend("/topic/game/" + gameId + "/player/" + playerId + "/answer", message);
    }
}
