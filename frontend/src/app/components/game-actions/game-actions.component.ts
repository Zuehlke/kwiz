import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuizService, CreateQuizRequest, JoinQuizRequest } from '../../services/quiz.service';
import { GameService } from '../../services/game.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-game-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-actions.component.html',
  styleUrls: ['./game-actions.component.scss']
})
export class GameActionsComponent {
  // Active tab signal
  activeTab = signal('create');

  // Form data
  quizName = signal('');
  playerName = signal('');
  quizId = signal('');
  errorMessage = signal('');

  constructor(
    private quizService: QuizService,
    private gameService: GameService,
    private router: Router
  ) {}

  // Set active tab
  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
    this.errorMessage.set('');
  }

  // Create a new quiz
  createQuiz(): void {
    if (!this.quizName()) {
      this.errorMessage.set('Please enter a quiz name');
      return;
    }

    // Generate a random quiz ID
    const randomQuizId = 'quiz_' + Math.random().toString(36).substring(2, 10);

    const request: CreateQuizRequest = {
      quizId: randomQuizId,
      quizName: this.quizName(),
      maxPlayers: 10 // Default value
    };

    this.quizService.createQuiz(request)
      .pipe(
        catchError(error => {
          console.error('Error creating quiz:', error);
          this.errorMessage.set('Failed to create quiz: ' + (error.message || 'Unknown error'));
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          console.log('Quiz created:', response);
          this.errorMessage.set('Quiz created successfully! Redirecting to admin page...');

          // Navigate to the quiz-master page (admin page) with the quiz ID
          this.router.navigate(['/quiz-master', response.quizId]);
        }
      });
  }

  // Join an existing quiz
  joinQuiz(): void {
    if (!this.quizId()) {
      this.errorMessage.set('Please enter a quiz ID');
      return;
    }

    // If player name is not provided, redirect to the player name page
    if (!this.playerName()) {
      this.router.navigate(['/player', this.quizId()]);
      return;
    }

    const request: JoinQuizRequest = {
      playerName: this.playerName()
    };

    this.quizService.joinQuiz(this.quizId(), request)
      .pipe(
        catchError(error => {
          console.error('Error joining quiz:', error);

          // If the error indicates that a player name is needed, redirect to the player name page
          if (error.error?.needsPlayerName) {
            this.router.navigate(['/player', this.quizId()]);
            return of(null);
          }

          this.errorMessage.set('Failed to join quiz: ' + (error.error?.error || error.message || 'Unknown error'));
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          console.log('Joined quiz:', response);
          this.errorMessage.set('Joined quiz successfully! Redirecting to waiting room...');

          // Store player data in local storage
          localStorage.setItem(`player_${response.quizId}`, JSON.stringify({
            playerId: response.playerId,
            playerName: response.playerName
          }));

          // Navigate to the waiting room using the redirectUrl from the response
          if (response.redirectUrl) {
            this.router.navigateByUrl(response.redirectUrl);
          } else {
            // Fallback in case redirectUrl is not provided
            this.router.navigate(['/waiting-room', response.quizId]);
          }
        }
      });
  }
}
