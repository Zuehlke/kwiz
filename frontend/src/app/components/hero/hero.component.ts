import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RotatingBallComponent } from '../rotating-ball/rotating-ball.component';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, RotatingBallComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  // Properties for the hero component
  title = 'Welcome to KwiZ';
  subtitle = 'The Ultimate Pub Quiz Experience';
  description = 'Create or join interactive quiz games with friends and colleagues. Test your knowledge, compete for the top spot, and have fun!';

  constructor(@Inject(DOCUMENT) private document: Document) {}

  scrollToGameActions(tab: string): void {
    // Prevent default anchor behavior
    event?.preventDefault();

    // Find the game-actions element
    const gameActionsElement = this.document.getElementById('game-actions');

    if (gameActionsElement) {
      // Scroll to the element
      gameActionsElement.scrollIntoView({ behavior: 'smooth' });

      // Find the tab button and click it
      setTimeout(() => {
        const tabButton = this.document.querySelector(`.tab-button:nth-child(${tab === 'create' ? 1 : 2})`);
        if (tabButton instanceof HTMLElement) {
          tabButton.click();
        }
      }, 500); // Small delay to ensure scroll completes first
    }
  }
}
