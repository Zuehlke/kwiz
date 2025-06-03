import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService, JoinQuizRequest } from '../services/quiz.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-join-quizz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './join-quizz.component.html',
  styleUrls: ['./join-quizz.component.scss']
})
export class JoinQuizzComponent implements OnInit {
  quizId = signal('');
  playerName = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    // Get the quiz ID from the route parameters
    this.route.paramMap.subscribe(params => {
      const quizId = params.get('quizId');
      if (quizId) {
        this.quizId.set(quizId);
      } else {
        this.errorMessage.set('No quiz ID provided');
      }
    });
  }

  updatePlayerName(value: string): void {
    this.playerName.set(value);
  }

  joinQuiz(): void {
    if (!this.playerName()) {
      this.errorMessage.set('Please enter a player name');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const request: JoinQuizRequest = {
      playerName: this.playerName()
    };

    this.quizService.joinQuiz(this.quizId(), request)
      .pipe(
        catchError(error => {
          console.error('Error joining quiz:', error);
          this.errorMessage.set('Failed to join quiz: ' + (error.error?.error || error.message || 'Unknown error'));
          this.isLoading.set(false);
          return of(null);
        })
      )
      .subscribe(response => {
        this.isLoading.set(false);
        if (response) {
          console.log('Joined quiz:', response);

          // Store player data in session storage (unique per tab)
          sessionStorage.setItem(`player_${response.quizId}`, JSON.stringify({
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
