import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { QuizService, CreateQuizRequest, JoinQuizRequest } from '../services/quiz.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  showCreateQuizForm = false;
  showJoinQuizForm = false;
  createQuizForm: FormGroup;
  joinQuizForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private quizService: QuizService
  ) {
    this.createQuizForm = this.fb.group({
      quizName: ['', [Validators.required, Validators.minLength(3)]],
      maxParticipants: [5, [Validators.required, Validators.min(1), Validators.max(20)]]
    });

    this.joinQuizForm = this.fb.group({
      quizId: ['', [Validators.required]],
      participantName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  toggleCreateQuizForm() {
    this.showCreateQuizForm = !this.showCreateQuizForm;
    this.showJoinQuizForm = false;
    this.errorMessage = '';
  }

  toggleJoinQuizForm() {
    this.showJoinQuizForm = !this.showJoinQuizForm;
    this.showCreateQuizForm = false;
    this.errorMessage = '';
  }

  onCreateQuiz() {
    if (this.createQuizForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const quizId = uuidv4();
      const quizName = this.createQuizForm.value.quizName;
      const maxParticipants = this.createQuizForm.value.maxParticipants;

      const request: CreateQuizRequest = {
        quizId,
        quizName,
        maxParticipants
      };

      this.quizService.createQuiz(request)
        .pipe(
          catchError(error => {
            console.error('Error creating quiz:', error);
            this.errorMessage = 'Failed to create quiz. Please try again.';
            this.isLoading = false;
            return of(null);
          })
        )
        .subscribe(response => {
          this.isLoading = false;
          if (response) {
            // Navigate to quiz master page
            this.router.navigate(['/quiz-master', response.quizId]);
          }
        });
    }
  }

  onJoinQuiz() {
    if (this.joinQuizForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const quizId = this.joinQuizForm.value.quizId;
      const participantName = this.joinQuizForm.value.participantName;

      // First check if the quiz exists
      this.quizService.getQuiz(quizId)
        .pipe(
          catchError(error => {
            console.error('Error checking quiz:', error);
            this.errorMessage = 'Quiz not found. Please check the ID and try again.';
            this.isLoading = false;
            return of(null);
          })
        )
        .subscribe(quizDetails => {
          if (quizDetails) {
            if (quizDetails.started) {
              this.errorMessage = 'This quiz has already started. You cannot join it now.';
              this.isLoading = false;
              return;
            }

            if (quizDetails.ended) {
              this.errorMessage = 'This quiz has already ended. You cannot join it now.';
              this.isLoading = false;
              return;
            }

            if (quizDetails.participantCount >= quizDetails.maxParticipants) {
              this.errorMessage = 'This quiz has reached the maximum number of participants.';
              this.isLoading = false;
              return;
            }

            // Join the quiz
            const request: JoinQuizRequest = {
              participantName
            };

            this.quizService.joinQuiz(quizId, request)
              .pipe(
                catchError(error => {
                  console.error('Error joining quiz:', error);
                  this.errorMessage = 'Failed to join quiz. Please try again.';
                  this.isLoading = false;
                  return of(null);
                })
              )
              .subscribe(response => {
                this.isLoading = false;
                if (response) {
                  // Navigate to participant page
                  this.router.navigate(['/participant', response.quizId], { 
                    queryParams: { 
                      participantId: response.participantId,
                      name: response.participantName 
                    } 
                  });
                }
              });
          }
        });
    }
  }
}
