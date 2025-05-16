import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { QuizService } from './quiz.service';
import { WebSocketService, WebSocketMessage } from './websocket.service';
import { Question, PlayerScore, GameState } from '../types/game.types';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Game state signals
  private _gameId = signal<string | null>(null);
  private _currentRound = signal<number>(0);
  private _totalRounds = signal<number>(0);
  private _currentQuestion = signal<Question | null>(null);
  private _timeRemaining = signal<number>(0);
  private _isAnswerSubmissionAllowed = signal<boolean>(false);
  private _isCurrentQuestionFinished = signal<boolean>(false);
  private _playerScore = signal<number>(0);
  private _leaderboard = signal<PlayerScore[]>([]);
  private _isAdmin = signal<boolean>(false);

  // Timer subscription
  private timerSubscription: Subscription | null = null;

  // Game state update subject
  private gameStateUpdateSubject = new Subject<GameState>();

  constructor(
    private quizService: QuizService,
    private webSocketService: WebSocketService,
    private router: Router
  ) {}

  /**
   * Initializes the game with the given game ID and initial state
   * 
   * @param gameId The ID of the game
   * @param isAdmin Whether the current user is the admin
   */
  initializeGame(gameId: string, isAdmin: boolean): void {
    // Set game ID and admin status
    this._gameId.set(gameId);
    this._isAdmin.set(isAdmin);

    // Connect to WebSocket
    this.webSocketService.connect();

    // Subscribe to quiz updates
    this.webSocketService.getQuizUpdates(gameId).subscribe({
      next: (message: WebSocketMessage) => {
        // Handle quiz updates
        console.log('Quiz update received:', message);
        
        // If the message contains game state updates, process them
        if (message.gameState) {
          this.handleGameStateUpdate(message.gameState);
        }
      },
      error: (error) => {
        console.error('Error receiving quiz updates:', error);
      }
    });

    // Emit initial game state
    this.emitGameState();
  }

  /**
   * Handles game state updates from the WebSocket
   * 
   * @param gameState The updated game state
   */
  private handleGameStateUpdate(gameState: any): void {
    // Update game state based on the received data
    if (gameState.currentRound !== undefined) {
      this._currentRound.set(gameState.currentRound);
    }
    
    if (gameState.totalRounds !== undefined) {
      this._totalRounds.set(gameState.totalRounds);
    }
    
    if (gameState.currentQuestion) {
      this.receiveNewQuestion(gameState.currentQuestion);
    }
    
    if (gameState.playerScore !== undefined) {
      this._playerScore.set(gameState.playerScore);
    }
    
    if (gameState.leaderboard) {
      this._leaderboard.set(gameState.leaderboard);
    }
    
    if (gameState.isCurrentQuestionFinished !== undefined) {
      this._isCurrentQuestionFinished.set(gameState.isCurrentQuestionFinished);
    }

    // Emit updated game state
    this.emitGameState();
  }

  /**
   * Emits the current game state
   */
  private emitGameState(): void {
    const gameState: GameState = {
      gameId: this._gameId(),
      currentRound: this._currentRound(),
      totalRounds: this._totalRounds(),
      currentQuestion: this._currentQuestion(),
      timeRemaining: this._timeRemaining(),
      isAnswerSubmissionAllowed: this._isAnswerSubmissionAllowed(),
      isCurrentQuestionFinished: this._isCurrentQuestionFinished(),
      playerScore: this._playerScore(),
      leaderboard: this._leaderboard(),
      isAdmin: this._isAdmin()
    };

    this.gameStateUpdateSubject.next(gameState);
  }

  /**
   * Starts the question timer
   */
  startQuestionTimer(): void {
    // Cancel any existing timer
    this.cancelTimer();

    const question = this._currentQuestion();
    if (!question) {
      console.error('Cannot start timer: No current question');
      return;
    }

    // Set initial time remaining
    this._timeRemaining.set(question.timeLimit);
    
    // Allow answer submission
    this._isAnswerSubmissionAllowed.set(true);
    
    // Reset question finished flag
    this._isCurrentQuestionFinished.set(false);

    // Start countdown timer
    this.timerSubscription = interval(1000)
      .pipe(
        takeWhile(() => this._timeRemaining() > 0)
      )
      .subscribe({
        next: () => {
          // Decrement time remaining
          this._timeRemaining.update(time => time - 1);
          
          // Emit updated game state
          this.emitGameState();
        },
        complete: () => {
          // Time's up
          this._isAnswerSubmissionAllowed.set(false);
          this._isCurrentQuestionFinished.set(true);
          
          // Emit updated game state
          this.emitGameState();
        }
      });
  }

  /**
   * Cancels the current timer
   */
  private cancelTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  /**
   * Submits an answer for the current question
   * 
   * @param questionId The ID of the question
   * @param answer The answer to submit
   */
  submitAnswer(questionId: string, answer: any): void {
    if (!this._isAnswerSubmissionAllowed()) {
      console.error('Answer submission not allowed');
      return;
    }

    const gameId = this._gameId();
    if (!gameId) {
      console.error('Cannot submit answer: No game ID');
      return;
    }

    // Get player ID from local storage
    const playerData = localStorage.getItem(`player_${gameId}`);
    if (!playerData) {
      console.error('Cannot submit answer: No player data found');
      return;
    }

    const { playerId } = JSON.parse(playerData);

    // TODO: Implement API call to submit answer
    console.log(`Submitting answer for question ${questionId}: ${answer}`);

    // For now, just disable further submissions for this player
    this._isAnswerSubmissionAllowed.set(false);
    
    // Emit updated game state
    this.emitGameState();
  }

  /**
   * Receives a new question from the backend
   * 
   * @param questionData The new question data
   */
  receiveNewQuestion(questionData: Question): void {
    // Set current question
    this._currentQuestion.set(questionData);
    
    // Reset time remaining
    this._timeRemaining.set(questionData.timeLimit);
    
    // Allow answer submission
    this._isAnswerSubmissionAllowed.set(true);
    
    // Reset question finished flag
    this._isCurrentQuestionFinished.set(false);
    
    // Start the timer
    this.startQuestionTimer();
    
    // Emit updated game state
    this.emitGameState();
  }

  /**
   * Requests the next question (admin only)
   */
  adminRequestNextQuestion(): void {
    if (!this._isAdmin()) {
      console.error('Only admins can request the next question');
      return;
    }

    if (!this._isCurrentQuestionFinished()) {
      console.error('Cannot request next question: Current question not finished');
      return;
    }

    const gameId = this._gameId();
    if (!gameId) {
      console.error('Cannot request next question: No game ID');
      return;
    }

    // TODO: Implement API call to request next question
    console.log('Requesting next question');
  }

  /**
   * Ends the game and cleans up resources
   */
  endGame(): void {
    // Cancel any active timer
    this.cancelTimer();
    
    // Disconnect from WebSocket
    this.webSocketService.disconnect();
    
    // Reset game state
    this._gameId.set(null);
    this._currentRound.set(0);
    this._totalRounds.set(0);
    this._currentQuestion.set(null);
    this._timeRemaining.set(0);
    this._isAnswerSubmissionAllowed.set(false);
    this._isCurrentQuestionFinished.set(false);
    this._playerScore.set(0);
    this._leaderboard.set([]);
    this._isAdmin.set(false);
    
    // Navigate to home page
    this.router.navigate(['/home']);
  }

  /**
   * Returns an observable of game state updates
   */
  getGameStateUpdates(): Observable<GameState> {
    return this.gameStateUpdateSubject.asObservable();
  }

  // Getters for game state
  get gameId() { return this._gameId; }
  get currentRound() { return this._currentRound; }
  get totalRounds() { return this._totalRounds; }
  get currentQuestion() { return this._currentQuestion; }
  get timeRemaining() { return this._timeRemaining; }
  get isAnswerSubmissionAllowed() { return this._isAnswerSubmissionAllowed; }
  get isCurrentQuestionFinished() { return this._isCurrentQuestionFinished; }
  get playerScore() { return this._playerScore; }
  get leaderboard() { return this._leaderboard; }
  get isAdmin() { return this._isAdmin; }
}