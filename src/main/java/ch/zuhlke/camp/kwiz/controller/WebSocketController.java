package ch.zuhlke.camp.kwiz.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

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
     */
    public void sendQuizUpdate(String quizId, int playerCount, int maxPlayers, boolean started) {
        Map<String, Object> message = new HashMap<>();
        message.put("quizId", quizId);
        message.put("playerCount", playerCount);
        message.put("maxPlayers", maxPlayers);
        message.put("started", started);

        messagingTemplate.convertAndSend("/topic/quiz/" + quizId + "/updates", message);
    }
}
