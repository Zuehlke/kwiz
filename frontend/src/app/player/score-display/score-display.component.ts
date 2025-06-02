import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerScore } from '../../types/game.types';

@Component({
  selector: 'app-score-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-display.component.html',
  styleUrls: ['./score-display.component.scss']
})
export class ScoreDisplayComponent {
  @Input() playerScore: number = 0;
  @Input() leaderboard: PlayerScore[] = [];
  @Input() showPlayerScore: boolean = true;

  /**
   * Returns the top 5 players from the leaderboard
   */
  get topPlayers(): PlayerScore[] {
    return this.leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /**
   * Returns the player's rank in the leaderboard
   */
  get playerRank(): number {
    const sortedLeaderboard = [...this.leaderboard].sort((a, b) => b.score - a.score);
    const playerIndex = sortedLeaderboard.findIndex(player => player.score === this.playerScore);
    return playerIndex !== -1 ? playerIndex + 1 : this.leaderboard.length + 1;
  }
}
