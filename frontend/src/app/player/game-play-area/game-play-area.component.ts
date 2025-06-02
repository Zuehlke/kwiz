import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { TimerDisplayComponent } from '../timer-display/timer-display.component';
import { ScoreDisplayComponent } from '../score-display/score-display.component';
import {GameStateDTO} from "../../types/game.types";
import {WebSocketService} from "../../services/websocket.service";

@Component({
  selector: 'app-game-play-area',
  standalone: true,
  imports: [
    CommonModule,
    QuestionDisplayComponent,
    TimerDisplayComponent,
    ScoreDisplayComponent
  ],
  templateUrl: './game-play-area.component.html',
  styleUrls: ['./game-play-area.component.scss']
})
export class GamePlayAreaComponent implements OnInit, OnDestroy {
  private gameStateSubscription: Subscription | null = null;
  private quizId: string | null = null;
  private gameId: string | null = null;
  gameState: GameStateDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    public gameService: GameService,
    private webSocketService: WebSocketService,
  ) {}

  ngOnInit(): void {
    // Get quiz ID from route params
    this.route.paramMap.subscribe(params => {
      this.quizId = params.get('quizId');
      this.gameId = params.get('gameId');
      console.log(this.gameId);

      if (this.quizId) {
        // Check if player data exists in local storage
        const playerData = localStorage.getItem(`player_${this.quizId}`);

        if (playerData && this.gameId) {
          this.subscribeToGameState(this.gameId);
        } else {
          console.error('No player data found for quiz ID:', this.quizId);
          // TODO: Handle error - redirect to join page or show error message
        }
      }
    });
  }

  private subscribeToGameState(gameId: string): void {

    this.webSocketService.connect();
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

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }

  }

  onAnswerSelected(answer: any): void {
    // todo
  }
}
