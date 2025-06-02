import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question } from '../../types/game.types';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-display.component.html',
  styleUrls: ['./question-display.component.scss']
})
export class QuestionDisplayComponent {
  @Input() question!: Question;
  @Input() isSubmissionAllowed: boolean = true;
  @Output() answerSelected = new EventEmitter<any>();

  selectedOption: string | null = null;
  textAnswer: string = '';
  isAnswerSubmitted: boolean = false;

  /**
   * Handles option selection for multiple choice questions
   * 
   * @param option The selected option
   */
  selectOption(option: string): void {
    if (this.isSubmissionAllowed && !this.isAnswerSubmitted) {
      this.selectedOption = option;
    }
  }

  /**
   * Submits the selected answer
   */
  submitAnswer(): void {
    if (!this.isSubmissionAllowed || this.isAnswerSubmitted) {
      return;
    }

    let answer: any;
    
    if (this.question.type === 'multiple-choice') {
      answer = this.selectedOption;
    } else if (this.question.type === 'text-input') {
      answer = this.textAnswer.trim();
    }

    if (answer) {
      this.answerSelected.emit(answer);
      this.isAnswerSubmitted = true;
    }
  }

  /**
   * Resets the component state for a new question
   */
  resetState(): void {
    this.selectedOption = null;
    this.textAnswer = '';
    this.isAnswerSubmitted = false;
  }
}