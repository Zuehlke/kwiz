import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-controls.component.html',
  styleUrls: ['./admin-controls.component.scss']
})
export class AdminControlsComponent {
  @Input() isQuestionFinished: boolean = false;
  @Output() nextQuestionRequested = new EventEmitter<void>();

  /**
   * Requests the next question
   */
  requestNextQuestion(): void {
    if (this.isQuestionFinished) {
      this.nextQuestionRequested.emit();
    }
  }
}