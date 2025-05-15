import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService, CreateQuizRequest, JoinQuizRequest } from '../../services/quiz.service';
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

  constructor(private quizService: QuizService) {}

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
          this.errorMessage.set('Quiz created successfully! Quiz ID: ' + response.quizId);
        }
      });
  }

  // Join an existing quiz
  joinQuiz(): void {
    if (!this.quizId()) {
      this.errorMessage.set('Please enter a quiz ID');
      return;
    }

    if (!this.playerName()) {
      this.errorMessage.set('Please enter a player name');
      return;
    }

    const request: JoinQuizRequest = {
      playerName: this.playerName()
    };

    this.quizService.joinQuiz(this.quizId(), request)
      .pipe(
        catchError(error => {
          console.error('Error joining quiz:', error);
          this.errorMessage.set('Failed to join quiz: ' + (error.error?.error || error.message || 'Unknown error'));
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          console.log('Joined quiz:', response);
          this.errorMessage.set('Joined quiz successfully! Player ID: ' + response.playerId);
        }
      });
  }
}
