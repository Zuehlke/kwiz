import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuizService, QuizDetails } from '../services/quiz.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.scss']
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  quizId: string | null = null;
  quizDetails: QuizDetails | null = null;
  players: any[] = [];
  private pollingSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.quizId = this.route.snapshot.paramMap.get('quizId');

    if (this.quizId) {
      // Initial fetch of quiz details
      this.fetchQuizDetails();

      // Poll for updates every 5 seconds
      this.pollingSubscription = interval(5000)
        .pipe(
          switchMap(() => this.quizService.getQuiz(this.quizId!))
        )
        .subscribe(
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

  ngOnDestroy(): void {
    // Clean up the polling subscription when the component is destroyed
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
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
}
