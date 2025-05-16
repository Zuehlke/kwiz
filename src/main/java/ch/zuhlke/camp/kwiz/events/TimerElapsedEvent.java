package ch.zuhlke.camp.kwiz.events;

import org.springframework.context.ApplicationEvent;

/**
 * Event that is published when a game timer elapses.
 * This event is used to decouple the GameTimerScheduler from the GameOrchestrationService
 * to resolve a circular dependency.
 */
public class TimerElapsedEvent extends ApplicationEvent {
    private final String timerId;
    private final String gameId;

    /**
     * Creates a new TimerElapsedEvent.
     *
     * @param source the object on which the event initially occurred
     * @param timerId the ID of the timer that elapsed
     * @param gameId the ID of the game associated with the timer
     */
    public TimerElapsedEvent(Object source, String timerId, String gameId) {
        super(source);
        this.timerId = timerId;
        this.gameId = gameId;
    }

    /**
     * Gets the ID of the timer that elapsed.
     *
     * @return the timer ID
     */
    public String getTimerId() {
        return timerId;
    }

    /**
     * Gets the ID of the game associated with the timer.
     *
     * @return the game ID
     */
    public String getGameId() {
        return gameId;
    }
}