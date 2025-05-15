import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

    // Here we would normally call a service to create the quiz
    console.log('Creating quiz:', this.quizName());
    // For now, just show a success message
    this.errorMessage.set('Quiz created successfully! (This is a placeholder)');
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

    // Here we would normally call a service to join the quiz
    console.log('Joining quiz:', this.quizId(), 'as', this.playerName());
    // For now, just show a success message
    this.errorMessage.set('Joined quiz successfully! (This is a placeholder)');
  }
}
