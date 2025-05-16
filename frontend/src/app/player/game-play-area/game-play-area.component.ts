import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { GameState } from '../../types/game.types';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { TimerDisplayComponent } from '../timer-display/timer-display.component';
import { AdminControlsComponent } from '../admin-controls/admin-controls.component';
import { ScoreDisplayComponent } from '../score-display/score-display.component';

@Component({
  selector: 'app-game-play-area',
  standalone: true,
  imports: [
    CommonModule,
    QuestionDisplayComponent,
    TimerDisplayComponent,
    AdminControlsComponent,
    ScoreDisplayComponent
  ],
  templateUrl: './game-play-area.component.html',
  styleUrls: ['./game-play-area.component.scss']
})
export class GamePlayAreaComponent implements OnInit, OnDestroy {
  private gameStateSubscription: Subscription | null = null;
  private quizId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public gameService: GameService
  ) {}

  ngOnInit(): void {
    // Get quiz ID from route params
    this.route.paramMap.subscribe(params => {
      this.quizId = params.get('quizId');
      
      if (this.quizId) {
        // Check if player data exists in local storage
        const playerData = localStorage.getItem(`player_${this.quizId}`);
        
        if (playerData) {
          // Initialize game with player role
          this.gameService.initializeGame(this.quizId, false);
          
          // Subscribe to game state updates
          this.gameStateSubscription = this.gameService.getGameStateUpdates().subscribe({
            next: (gameState: GameState) => {
              console.log('Game state updated:', gameState);
            },
            error: (error) => {
              console.error('Error receiving game state updates:', error);
            }
          });
        } else {
          console.error('No player data found for quiz ID:', this.quizId);
          // TODO: Handle error - redirect to join page or show error message
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }
    
    // End game and clean up resources
    this.gameService.endGame();
  }

  /**
   * Handles answer selection from QuestionDisplayComponent
   * 
   * @param answer The selected answer
   */
  onAnswerSelected(answer: any): void {
    const questionId = this.gameService.currentQuestion()?.id;
    
    if (questionId) {
      this.gameService.submitAnswer(questionId, answer);
    }
  }

  /**
   * Handles next question request from AdminControlsComponent
   */
  onNextQuestionRequested(): void {
    this.gameService.adminRequestNextQuestion();
  }
}