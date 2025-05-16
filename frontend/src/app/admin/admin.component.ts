import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuizService, QuizDetails } from '../services/quiz.service';
import { WebSocketService, WebSocketMessage, PlayerInfo } from '../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  quizId: string | null = null;
  quizDetails: QuizDetails | null = null;
  players: PlayerInfo[] = [];
  copySuccess: boolean = false;
  private playerCountSubscription: Subscription | null = null;
  private wsConnectionSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private webSocketService: WebSocketService
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

    // Disconnect from WebSocket
    this.webSocketService.disconnect();
  }

  private fetchQuizDetails(): void {
    if (this.quizId) {
      this.quizService.getQuiz(this.quizId).subscribe(
        (quizDetails) => {
          this.quizDetails = quizDetails;
        },
        (error) => {
          console.error('Error fetching quiz details:', error);
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

  // Method to copy quiz ID to clipboard
  copyQuizId(): void {
    if (this.quizId) {
      navigator.clipboard.writeText(this.quizId)
        .then(() => {
          console.log('Quiz ID copied to clipboard:', this.quizId);
          this.copySuccess = true;
          // Reset the success message after 2 seconds
          setTimeout(() => {
            this.copySuccess = false;
          }, 2000);
        })
        .catch(err => {
          console.error('Could not copy quiz ID to clipboard:', err);
        });
    }
  }
}
