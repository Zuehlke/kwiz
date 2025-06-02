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
 * Represents a player's answer information
 */
export interface PlayerAnswer {
  playerId: string;
  playerName: string;
  answerTimeMs: number;
}

/**
 * Represents the game state DTO from the backend
 */
export interface GameStateDTO {
  gameId: string;
  status: string;
  currentRoundId?: string;
  currentRoundName?: string;
  totalRounds?: number;
  currentQuestionId?: string;
  currentQuestionText?: string;
  remainingSeconds?: number;
  acceptingAnswers?: boolean;
  players?: Array<{
    playerId: string;
    displayName: string;
    score: number;
  }>;
  playersAnswered?: number;
  playerAnswers?: PlayerAnswer[];
  fastestAnswerTime?: number;
}
