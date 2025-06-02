import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { TimerDisplayComponent } from '../timer-display/timer-display.component';
import { ScoreDisplayComponent } from '../score-display/score-display.component';
import { GameStateDTO, Question, PlayerScore } from "../../types/game.types";
import { WebSocketService } from "../../services/websocket.service";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-play-area',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuestionDisplayComponent,
    TimerDisplayComponent,
    ScoreDisplayComponent
  ],
  templateUrl: './game-play-area.component.html',
  styleUrls: ['./game-play-area.component.scss']
})
export class GamePlayAreaComponent implements OnInit, OnDestroy {
  @Input() isAdminMode: boolean = false;
  @Input() adminGameState: GameStateDTO | null = null;
  @Input() adminGameId: string | null = null;

  private gameStateSubscription: Subscription | null = null;
  private quizId: string | null = null;
  private gameId: string | null = null;
  gameState: GameStateDTO | null = null;

  // Player information
  currentPlayer: { playerId: string, playerName: string } | null = null;
  playerAnswer: string | null = null;
  answerSubmitted: boolean = false;
  answerTime: number | null = null;
  answerStartTime: number | null = null;

  // Current question
  currentQuestion: Question | null = null;

  // Leaderboard
  leaderboard: PlayerScore[] = [];

  // Stats placeholders
  totalPlayers: number = 0;
  playersAnswered: number = 0;
  fastestAnswerTime: number | null = null;

  constructor(
    private route: ActivatedRoute,
    public gameService: GameService,
    private webSocketService: WebSocketService,
  ) {}

  ngOnInit(): void {
    // If in admin mode, use the provided game state and game ID
    if (this.isAdminMode) {
      console.log('Game Play Area in Admin Mode');
      if (this.adminGameId) {
        this.gameId = this.adminGameId;
        this.subscribeToGameState(this.adminGameId);
      }

      // If adminGameState is provided, use it directly
      if (this.adminGameState) {
        this.gameState = this.adminGameState;
        this.processGameState(this.adminGameState);
      }
    } else {
      // Regular player mode - get quiz ID from route params
      this.route.paramMap.subscribe(params => {
        this.quizId = params.get('quizId');
        this.gameId = params.get('gameId');
        console.log(this.gameId);

        if (this.quizId) {
          // Check if player data exists in local storage
          const playerDataStr = localStorage.getItem(`player_${this.quizId}`);

          if (playerDataStr && this.gameId) {
            try {
              const playerData = JSON.parse(playerDataStr);
              this.currentPlayer = {
                playerId: playerData.playerId,
                playerName: playerData.playerName
              };

              // Initialize answer start time when component loads
              this.answerStartTime = new Date().getTime();

              this.subscribeToGameState(this.gameId);
            } catch (error) {
              console.error('Error parsing player data:', error);
              // TODO: Handle error - redirect to join page or show error message
            }
          } else {
            console.error('No player data found for quiz ID:', this.quizId);
            // TODO: Handle error - redirect to join page or show error message
          }
        }
      });
    }
  }

  private subscribeToGameState(gameId: string): void {
    this.webSocketService.connect();
    // Unsubscribe from previous game state if exists
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }

    // Subscribe to game state updates
    this.gameStateSubscription = this.webSocketService.getGameStateUpdates(gameId).subscribe({
      next: (gameState: GameStateDTO) => {
        console.log('Received game state update:', gameState);
        this.gameState = gameState;

        // Process game state
        this.processGameState(gameState);
      },
      error: (error: Error) => {
        console.error('Error receiving game state updates:', error);
      }
    });
  }

  /**
   * Process the game state update
   */
  private processGameState(gameState: GameStateDTO): void {
    // Update total players
    if (gameState.players) {
      this.totalPlayers = gameState.players.length;

      // Create leaderboard
      this.leaderboard = gameState.players.map(player => ({
        playerId: player.playerId,
        playerName: player.displayName,
        score: player.score
      }));

      // Reset answer if a new question is detected
      if (this.currentQuestion?.id !== gameState.currentQuestionId) {
        this.resetAnswer();
      }

      // Create current question object if there is a current question
      if (gameState.currentQuestionId && gameState.currentQuestionText) {
        this.currentQuestion = {
          id: gameState.currentQuestionId,
          text: gameState.currentQuestionText,
          options: [], // Backend doesn't provide options yet
          type: 'text-input', // Default to text input for now
          timeLimit: gameState.remainingSeconds || 60
        };

        // Reset answer start time for the new question
        if (!this.answerSubmitted) {
          this.answerStartTime = new Date().getTime();
        }
      }

      // Update players answered count from the game state
      this.playersAnswered = gameState.playersAnswered || 0;

      // Update fastest answer time from the game state
      this.fastestAnswerTime = gameState.fastestAnswerTime || null;
    }
  }

  /**
   * Reset the answer state
   */
  private resetAnswer(): void {
    this.playerAnswer = null;
    this.answerSubmitted = false;
    this.answerTime = null;
    this.answerStartTime = new Date().getTime();
  }

  /**
   * Handle the player's answer submission
   */
  onAnswerSelected(answer: string): void {
    if (!this.answerSubmitted && this.gameState?.acceptingAnswers && this.currentPlayer && this.currentQuestion) {
      this.playerAnswer = answer;
      this.answerSubmitted = true;

      // Calculate time taken to answer
      const endTime = new Date().getTime();
      this.answerTime = this.answerStartTime ? Math.floor((endTime - this.answerStartTime) / 1000) : null;

      // Send answer to backend using GameOrchestrationService
      this.gameService.submitAnswer(
        this.gameId!,
        this.currentPlayer.playerId,
        this.currentQuestion.id,
        answer
      ).subscribe({
        next: () => {
          console.log('Answer submitted successfully');
        },
        error: (error) => {
          console.error('Error submitting answer:', error);
          // Reset answer submission state on error
          this.answerSubmitted = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }
  }

  /**
   * Get the current player's score from the game state
   */
  getCurrentPlayerScore(): number {
    if (!this.gameState?.players || !this.currentPlayer) {
      return 0;
    }

    const player = this.gameState.players.find(p => p.playerId === this.currentPlayer?.playerId);
    return player ? player.score : 0;
  }

}
