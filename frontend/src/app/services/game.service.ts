import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval, Subscription, catchError, of, map } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';
import { QuizService } from './quiz.service';
import { WebSocketService, WebSocketMessage } from './websocket.service';
import { Question, PlayerScore, GameStateDTO } from '../types/game.types';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Game state signals
  private _gameState = signal<GameStateDTO | null>(null);
  private _gameId = signal<string | null>(null);
  private _isAdmin = signal<boolean>(false);

  // Timer subscription
  private timerSubscription: Subscription | null = null;

  // Game state update subject
  private gameStateUpdateSubject = new Subject<GameStateDTO>();

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

    // Subscribe to game state updates
    this.webSocketService.getGameStateUpdates(gameId).subscribe({
      next: (gameState: GameStateDTO) => {
        console.log('Game state update received:', gameState);
        this.handleGameStateUpdate(gameState);
      },
      error: (error) => {
        console.error('Error receiving game state updates:', error);
      }
    });

    // Fetch initial game state
    this.fetchGameState(gameId).subscribe({
      next: (gameState: GameStateDTO) => {
        console.log('Initial game state fetched:', gameState);
      },
      error: (error) => {
        console.error('Error fetching initial game state:', error);
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
  fetchGameState(gameId: string): Observable<GameStateDTO> {
    // Remove 'quiz_' prefix from gameId if it exists
    const formattedGameId = gameId.startsWith('quiz_') ? gameId.substring(5) : gameId;

    return this.http.get<GameStateDTO>(`${this.gameApiUrl}/${formattedGameId}`).pipe(
      tap(gameState => {
        console.log('Fetched game state:', gameState);
        // Handle the game state update
        this.handleGameStateUpdate(gameState);
      })
    );
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

    // Update the game state signal with the new state
    this._gameState.set(gameState);

    // Emit updated game state
    this.emitGameState();
  }

  /**
   * Emits the current game state
   */
  private emitGameState(): void {
    const currentState = this._gameState();
    if (currentState) {
      this.gameStateUpdateSubject.next(currentState);
    }
  }

  /**
   * Returns an observable that emits game state updates
   * 
   * @returns An observable of game state updates
   */
  getGameStateUpdates(): Observable<GameStateDTO> {
    return this.gameStateUpdateSubject.asObservable();
  }

  /**
   * Returns the current game state
   * 
   * @returns The current game state
   */
  getCurrentGameState(): GameStateDTO | null {
    return this._gameState();
  }

  /**
   * Submits an answer for the current question
   * 
   * @param gameId The ID of the game
   * @param playerId The ID of the player
   * @param questionId The ID of the question
   * @param answer The answer to submit
   * @returns An Observable that completes when the answer is submitted
   */
  submitAnswer(gameId: string, playerId: string, questionId: string, answer: string): Observable<any> {
    return this.http.post(
      `${this.gameApiUrl}/${gameId}/answers`, 
      null, 
      { 
        params: {
          playerId,
          questionId,
          answerText: answer
        }
      }
    ).pipe(
      tap(() => console.log('Answer submitted successfully')),
      catchError(error => {
        console.error('Error submitting answer:', error);
        return of(null);
      })
    );
  }

  /**
   * Advances to the next question (admin only)
   * 
   * @param gameId The ID of the game
   * @returns An Observable that completes when the next question is loaded
   */
  adminAdvanceToNextQuestion(gameId: string): Observable<any> {
    return this.http.post(
      `${this.gameApiUrl}/${gameId}/next-question`,
      null,
      {
        params: {
          adminId: 'notimplemented' // This is a placeholder, as the backend uses a fixed admin ID
        }
      }
    ).pipe(
      tap(() => console.log('Advanced to next question successfully')),
      catchError(error => {
        console.error('Error advancing to next question:', error);
        return of(null);
      })
    );
  }




}
