/**
 * Interfaces for game state management
 */

/**
 * Represents a question in the game
 */
export interface Question {
  id: string;
  text: string;
  options: string[];
  type: 'multiple-choice' | 'text-input';
  timeLimit: number;
}

/**
 * Represents a player's score in the game
 */
export interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number;
}

/**
 * Represents the state of the game
 */
export interface GameState {
  gameId: string | null;
  currentRound: number;
  totalRounds: number;
  currentQuestion: Question | null;
  timeRemaining: number;
  isAnswerSubmissionAllowed: boolean;
  isCurrentQuestionFinished: boolean;
  playerScore: number;
  leaderboard: PlayerScore[];
  isAdmin: boolean;
}