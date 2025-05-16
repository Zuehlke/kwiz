import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval, Subscription, catchError, of } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';
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
  private _isGameStarted = signal<boolean>(false);

  // Timer subscription
  private timerSubscription: Subscription | null = null;

  // Game state update subject
  private gameStateUpdateSubject = new Subject<GameState>();

  private apiUrl = '/api/quizzes';
  private gameApiUrl = '/api/games';

  constructor(
    private quizService: QuizService,
    private webSocketService: WebSocketService,
    private router: Router,
    private http: HttpClient
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

    // Set default round to 1 instead of 0
    this._currentRound.set(1);

    // Connect to WebSocket
    this.webSocketService.connect();

    // Fetch initial game state
    this.fetchGameState(gameId);

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
   * Fetches the current game state from the backend
   * 
   * @param gameId The ID of the game
   */
  fetchGameState(gameId: string): void {
    this.quizService.getQuiz(gameId)
      .pipe(
        catchError(error => {
          console.error('Error fetching game state:', error);
          return of(null);
        })
      )
      .subscribe(quizDetails => {
        if (quizDetails) {
          console.log('Fetched game state:', quizDetails);

          // Update game started status
          this._isGameStarted.set(quizDetails.started);

          // Fetch rounds information
          this.quizService.getRounds(gameId)
            .pipe(
              catchError(error => {
                console.error('Error fetching rounds:', error);
                return of([]);
              })
            )
            .subscribe(rounds => {
              if (rounds && rounds.length > 0) {
                console.log('Fetched rounds:', rounds);
                this._totalRounds.set(rounds.length);

                // If game has started, set current round to 1
                if (quizDetails.started) {
                  this._currentRound.set(1);

                  // If the game has started, request the current question state
                  this.requestCurrentGameState(gameId);
                }

                // Emit updated game state
                this.emitGameState();
              }
            });
        }
      });
  }

  /**
   * Starts the game (admin only)
   */
  startGame(): void {
    if (!this._isAdmin()) {
      console.error('Only admins can start the game');
      return;
    }

    const gameId = this._gameId();
    if (!gameId) {
      console.error('Cannot start game: No game ID');
      return;
    }

    console.log('Starting game...');
    this.quizService.startQuiz(gameId)
      .pipe(
        catchError(error => {
          console.error('Error starting game:', error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          console.log('Game started successfully:', response);
          this._isGameStarted.set(true);

          // Set current round to 1 when game starts
          this._currentRound.set(1);

          // Emit updated game state
          this.emitGameState();

          // Automatically request the first question after starting the game
          this.requestFirstQuestion(gameId);
        }
      });
  }

  /**
   * Handles game state updates from the WebSocket
   * 
   * @param gameState The updated game state
   */
  private handleGameStateUpdate(gameState: any): void {
    console.log('Handling game state update:', gameState);

    // Update game started status based on status
    if (gameState.status) {
      // If we have any status other than CREATED, the game has started
      this._isGameStarted.set(gameState.status !== 'CREATED');
    }

    // Extract round information
    if (gameState.currentRoundId) {
      // If we have a currentRoundId, we're in a round
      // Set current round to at least 1 if we have a round
      this._currentRound.set(Math.max(1, this._currentRound()));

      // If we have a currentRoundName that contains a number, extract it
      if (gameState.currentRoundName && gameState.currentRoundName.match(/\d+/)) {
        const roundNumber = parseInt(gameState.currentRoundName.match(/\d+/)[0]);
        if (!isNaN(roundNumber)) {
          this._currentRound.set(roundNumber);
        }
      }
    }

    // Update total rounds if we have information about it
    if (gameState.totalRounds) {
      this._totalRounds.set(gameState.totalRounds);
    }

    // Extract question information
    if (gameState.currentQuestionId && gameState.currentQuestionText) {
      const questionData: Question = {
        id: gameState.currentQuestionId,
        text: gameState.currentQuestionText,
        timeLimit: gameState.remainingSeconds || 30, // Default to 30 seconds if not provided
        options: [], // We don't have options in the backend DTO
        type: 'text-input' // Default to text-input since we don't have this info from backend
      };
      this.receiveNewQuestion(questionData);
    } else if (this._isGameStarted() && !this._currentQuestion()) {
      // If game has started but no question is available, we're waiting for the next question
      // Make sure we're not showing "Round 0 of 0"
      if (this._currentRound() === 0) {
        this._currentRound.set(1);
      }
    }

    // Extract player score and leaderboard
    if (gameState.players && gameState.players.length > 0) {
      // Find the current player's score
      const playerData = localStorage.getItem(`player_${gameState.gameId}`);
      if (playerData) {
        const { playerId } = JSON.parse(playerData);
        const currentPlayer = gameState.players.find((p: any) => p.playerId === playerId);
        if (currentPlayer) {
          this._playerScore.set(currentPlayer.score);
        }
      }

      // Create leaderboard from players
      const leaderboard = gameState.players.map((player: any) => ({
        playerId: player.playerId,
        playerName: player.displayName,
        score: player.score
      }));
      this._leaderboard.set(leaderboard);
    }

    // Extract answer submission status
    if (gameState.acceptingAnswers !== undefined) {
      this._isAnswerSubmissionAllowed.set(gameState.acceptingAnswers);
    }

    // Extract question finished status based on game status
    if (gameState.status) {
      // If status is QUESTION_CLOSED, the question is finished
      this._isCurrentQuestionFinished.set(gameState.status === 'QUESTION_CLOSED');
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
      isAdmin: this._isAdmin(),
      isGameStarted: this._isGameStarted()
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

    this.sendQuestionToPlayers();
  }

  /**
   * Sends the current question to all players (admin only)
   * This method bypasses the check for whether the current question is finished
   */
  sendQuestionToPlayers(): void {
    if (!this._isAdmin()) {
      console.error('Only admins can send questions to players');
      return;
    }

    const gameId = this._gameId();
    if (!gameId) {
      console.error('Cannot send question: No game ID');
      return;
    }

    console.log('Sending question to players');

    // Get admin ID from local storage
    const adminData = localStorage.getItem(`player_${gameId}`);
    if (!adminData) {
      console.error('Cannot send question: No admin data found');
      return;
    }

    const { playerId: adminId } = JSON.parse(adminData);

    // Remove 'quiz_' prefix from gameId if it exists
    const formattedGameId = gameId.startsWith('quiz_') ? gameId.substring(5) : gameId;

    // Make API call to advance to the next question
    this.http.post(`${this.gameApiUrl}/${formattedGameId}/next-question?adminId=${adminId}`, {})
      .pipe(
        catchError(error => {
          console.error('Error sending question:', error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          console.log('Question sent successfully:', response);
        }
      });
  }

  /**
   * Requests the first question after the game starts (admin only)
   * 
   * @param gameId The ID of the game
   */
  private requestFirstQuestion(gameId: string): void {
    console.log('Requesting first question after game start');

    // Get admin ID from local storage
    const adminData = localStorage.getItem(`player_${gameId}`);
    if (!adminData) {
      console.error('Cannot request first question: No admin data found');
      return;
    }

    const { playerId: adminId } = JSON.parse(adminData);

    // Remove 'quiz_' prefix from gameId if it exists
    const formattedGameId = gameId.startsWith('quiz_') ? gameId.substring(5) : gameId;

    // Make API call to get the first question
    this.http.post(`${this.gameApiUrl}/${formattedGameId}/next-question?adminId=${adminId}`, {})
      .pipe(
        catchError(error => {
          console.error('Error requesting first question:', error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          console.log('First question requested successfully:', response);
        }
      });
  }

  /**
   * Requests the current game state for a player who joined a game that's already started
   * 
   * @param gameId The ID of the game
   */
  private requestCurrentGameState(gameId: string): void {
    console.log('Requesting current game state for player');

    // Get player ID from local storage
    const playerData = localStorage.getItem(`player_${gameId}`);
    if (!playerData) {
      console.error('Cannot request current game state: No player data found');
      return;
    }

    const { playerId } = JSON.parse(playerData);

    // Remove 'quiz_' prefix from gameId if it exists
    const formattedGameId = gameId.startsWith('quiz_') ? gameId.substring(5) : gameId;

    // Since there's no specific endpoint for players to request the current question,
    // we'll use the same approach as the admin by requesting the next question
    // This will cause the backend to send the current question to all players
    this.http.post(`${this.gameApiUrl}/${formattedGameId}/next-question?adminId=${playerId}`, {})
      .pipe(
        catchError(error => {
          console.error('Error requesting current game state:', error);

          // If the admin endpoint fails, try a more direct approach
          // by simulating a game state update
          console.log('Simulating game state update to get current question');

          // Create a mock question to display until the real one is received
          const mockQuestion: Question = {
            id: 'temp-question-id',
            text: 'Waiting for the current question...',
            timeLimit: 30,
            options: [],
            type: 'text-input'
          };

          // Set the mock question as the current question
          this._currentQuestion.set(mockQuestion);

          // Emit updated game state
          this.emitGameState();

          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          console.log('Current game state requested successfully:', response);
        }
      });
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
  get isGameStarted() { return this._isGameStarted; }
}
