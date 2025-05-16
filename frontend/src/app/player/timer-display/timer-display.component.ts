import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer-display.component.html',
  styleUrls: ['./timer-display.component.scss']
})
export class TimerDisplayComponent implements OnChanges {
  @Input() timeRemaining: number = 0;
  
  // Calculated properties for display
  progressPercentage: number = 100;
  timerColor: string = '#4caf50'; // Green by default

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timeRemaining']) {
      this.updateTimerDisplay();
    }
  }

  /**
   * Updates the timer display based on the time remaining
   */
  private updateTimerDisplay(): void {
    // Calculate progress percentage (assuming max time is 60 seconds)
    // This could be improved by passing the max time as an input
    const maxTime = 60;
    this.progressPercentage = (this.timeRemaining / maxTime) * 100;
    
    // Set color based on time remaining
    if (this.timeRemaining <= 5) {
      this.timerColor = '#f44336'; // Red for last 5 seconds
    } else if (this.timeRemaining <= 15) {
      this.timerColor = '#ff9800'; // Orange for last 15 seconds
    } else {
      this.timerColor = '#4caf50'; // Green otherwise
    }
  }

  /**
   * Formats the time remaining as MM:SS
   */
  formatTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}