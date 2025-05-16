package ch.zuhlke.camp.kwiz.domain;

/**
 * GameStatus is an enum that represents the various states a game can be in.
 * It is used by the Game aggregate to track the overall state of the game.
 */
public enum GameStatus {
    /**
     * The game is in the lobby state, waiting for players to join.
     */
    LOBBY,
    
    /**
     * A question is currently active, the timer is running, and the game is accepting answers.
     */
    QUESTION_ACTIVE,
    
    /**
     * The question timer has ended or the question has been manually closed.
     * The game is not accepting answers for the current question.
     */
    QUESTION_CLOSED,
    
    /**
     * The current round has been completed.
     */
    ROUND_COMPLETED,
    
    /**
     * The game has ended.
     */
    GAME_OVER
}