import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuizService, QuizDetails } from '../services/quiz.service';
import { WebSocketService, WebSocketMessage } from '../services/websocket.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { QuizService, QuizDetails, SubmitQuestionRequest, PlayerQuestion } from '../services/quiz.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.scss']
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  quizId: string | null = null;
  quizDetails: QuizDetails | null = null;
  players: any[] = [];
  private playerCountSubscription: Subscription | null = null;
  private wsConnectionSubscription: Subscription | null = null;

  // Properties for question submission
  playerId: string | null = null;
  newQuestion: SubmitQuestionRequest = {
    questionText: '',
    correctAnswers: [''],
    timeLimit: 30
  };
  submittingQuestion = false;
  questionSubmitted = false;
  errorMessage = '';

  // Properties for submitted questions
  submittedQuestions: PlayerQuestion[] = [];
  loadingQuestions = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.quizId = this.route.snapshot.paramMap.get('quizId');
    this.playerId = this.getPlayerId();

    if (this.quizId) {
      // Initial fetch of quiz details
      this.fetchQuizDetails();

        if (this.playerId) {
            this.fetchSubmittedQuestions();
        }

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

            // If the quiz has started, navigate to the player page
            if (this.quizDetails && this.quizDetails.started) {
              console.log('Quiz has started, navigating to player page');
              this.router.navigate(['/player', this.quizId]);
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

          // If the quiz has started, navigate to the player page
          if (quizDetails.started) {
            this.router.navigate(['/player', this.quizId]);
          }
        },
        (error) => {
          console.error('Error fetching quiz details:', error);
        }
      );
    }
  }

  // Get the player ID from local storage
  private getPlayerId(): string | null {
    const playerData = localStorage.getItem(`player_${this.quizId}`);
    if (playerData) {
      try {
        const data = JSON.parse(playerData);
        return data.playerId;
      } catch (e) {
        console.error('Error parsing player data:', e);
      }
    }
    return null;
  }

  // Add a new correct answer field
  addCorrectAnswer(): void {
    this.newQuestion.correctAnswers.push('');
  }

  // Remove a correct answer field
  removeCorrectAnswer(index: number): void {
    if (this.newQuestion.correctAnswers.length > 1) {
      this.newQuestion.correctAnswers.splice(index, 1);
    }
  }

  // Fetch submitted questions
  fetchSubmittedQuestions(): void {
    if (!this.quizId || !this.playerId) {
      return;
    }

    this.loadingQuestions = true;
    this.quizService.getPlayerSubmittedQuestions(this.quizId, this.playerId).subscribe(
      (questions) => {
        this.submittedQuestions = questions;
        this.loadingQuestions = false;
      },
      (error) => {
        console.error('Error fetching submitted questions:', error);
        this.loadingQuestions = false;
      }
    );
  }

  // Submit the question
  submitQuestion(): void {
    this.errorMessage = '';
    this.submittingQuestion = true;
    this.playerId = this.getPlayerId();

    if (!this.playerId) {
      this.errorMessage = 'Player ID not found. Please rejoin the quiz.';
      this.submittingQuestion = false;
      return;
    }

    if (!this.quizId) {
      this.errorMessage = 'Quiz ID not found.';
      this.submittingQuestion = false;
      return;
    }

    // Filter out empty correct answers
    const filteredQuestion = {
      ...this.newQuestion,
      correctAnswers: this.newQuestion.correctAnswers.filter(answer => answer.trim() !== '')
    };

    if (filteredQuestion.correctAnswers.length === 0) {
      this.errorMessage = 'Please provide at least one correct answer.';
      this.submittingQuestion = false;
      return;
    }

    if (!filteredQuestion.questionText.trim()) {
      this.errorMessage = 'Please provide a question.';
      this.submittingQuestion = false;
      return;
    }

    this.quizService.submitQuestion(this.quizId, this.playerId, filteredQuestion).subscribe(
      (response) => {
        this.submittingQuestion = false;
        this.questionSubmitted = true;
        // Reset the form
        this.newQuestion = {
          questionText: '',
          correctAnswers: [''],
          timeLimit: 30
        };
        // Fetch the updated list of submitted questions
        this.fetchSubmittedQuestions();
        // Hide the success message after 3 seconds
        setTimeout(() => {
          this.questionSubmitted = false;
        }, 3000);
      },
      (error) => {
        this.submittingQuestion = false;
        if (error.status === 409) {
          this.errorMessage = 'Cannot submit questions after the quiz has started.';
        } else {
          this.errorMessage = 'Error submitting question. Please try again.';
        }
        console.error('Error submitting question:', error);
      }
    );
  }
}
