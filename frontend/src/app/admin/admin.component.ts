import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuizService, QuizDetails } from '../services/quiz.service';
import { WebSocketService, WebSocketMessage, PlayerInfo } from '../services/websocket.service';
import { Subscription } from 'rxjs';
import {GameService} from "../services/game.service";
import {GameStateDTO} from "../types/game.types";
import {JoinQuizInfoComponent} from "../shared/join-quiz-info/join-quiz-info.component";
import {GamePlayAreaComponent} from "../player/game-play-area/game-play-area.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, JoinQuizInfoComponent, GamePlayAreaComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  quizId: string | null = null;
  quizDetails: QuizDetails | null = null;
  gameState: GameStateDTO | null = null;
  players: PlayerInfo[] = [];
  private playerCountSubscription: Subscription | null = null;
  private wsConnectionSubscription: Subscription | null = null;
  private gameStateSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private webSocketService: WebSocketService,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.quizId = this.route.snapshot.paramMap.get('quizId');

    if (this.quizId) {
      // Initial fetch of quiz details
      this.fetchQuizDetails();

      // Connect to WebSocket
      this.webSocketService.connect();

      // Subscribe to WebSocket connection status
      this.wsConnectionSubscription = this.webSocketService.getConnectionStatus().subscribe(
        (connected) => {
          console.log('WebSocket connection status:', connected);
        }
      );

      // Subscribe to quiz updates
      // The WebSocketService will handle waiting for the connection to be established
      this.playerCountSubscription = this.webSocketService.getQuizUpdates(this.quizId).subscribe({
        next: (message) => {
          console.log('Received quiz update:', message);
          if (this.quizDetails) {
            // Update quiz details with WebSocket data
            this.quizDetails = {
              ...this.quizDetails,
              playerCount: message.playerCount,
              maxPlayers: message.maxPlayers,
              started: message.started ?? false
            };

            // Update players list if available
            if (message.players) {
              this.players = message.players;
            }

            // If there's a current game ID, subscribe to game state updates
            if (message.currentGameId) {
              console.log('subscribing to Current game ID:', message.currentGameId); // Add this line for debug
              this.subscribeToGameState(message.currentGameId);
            }
          }
        },
        error: (error) => {
          console.error('Error receiving quiz updates:', error);
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when the component is destroyed
    if (this.playerCountSubscription) {
      this.playerCountSubscription.unsubscribe();
    }

    if (this.wsConnectionSubscription) {
      this.wsConnectionSubscription.unsubscribe();
    }

    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }

    // Disconnect from WebSocket
    this.webSocketService.disconnect();
  }

  private subscribeToGameState(gameId: string): void {
    // Unsubscribe from previous game state if exists
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }

    // Subscribe to game state updates
    this.gameStateSubscription = this.webSocketService.getGameStateUpdates(gameId).subscribe({
      next: (gameState: GameStateDTO) => {
        console.log('Received game state update:', gameState);
        this.gameState = gameState;
      },
      error: (error: Error) => {
        console.error('Error receiving game state updates:', error);
      }
    });
  }

  private fetchQuizDetails(): void {
    if (this.quizId) {
      this.quizService.getQuiz(this.quizId).subscribe(
        (quizDetails) => {
          this.quizDetails = quizDetails;
          if (this.quizDetails.currentGameId) {
            console.log('fetch current game with ID:', this.quizDetails.currentGameId);
            this.gameService.fetchGameState(this.quizDetails.currentGameId).subscribe(
              (gameState) => {
                console.log('Received initial game state:', gameState);
                this.gameState = gameState;
              },
              (error) => {
                console.error('Error fetching initial game state:', error);
              }
            );
          }
        },
        (error) => {
          console.error('Error fetching quiz details:', error);
          // Redirect to home page with error message if quiz doesn't exist
          if (error.status === 404) {
            alert('Quiz not found. Please create a quiz first.');
            this.router.navigate(['/home']);
          }
        }
      );
    }
  }

  // Method to start the quiz
  startQuiz(): void {
    if (this.quizId) {
      console.log('Starting quiz:', this.quizId);
      this.quizService.startQuiz(this.quizId).subscribe(
        (quizDetails) => {
          console.log('Quiz started successfully:', quizDetails);
          this.quizDetails = quizDetails;
        },
        (error) => {
          console.error('Error starting quiz:', error);
        }
      );
    }
  }

}
