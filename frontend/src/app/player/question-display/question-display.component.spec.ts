import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionDisplayComponent } from './question-display.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Question } from '../../types/game.types';

describe('QuestionDisplayComponent', () => {
  let component: QuestionDisplayComponent;
  let fixture: ComponentFixture<QuestionDisplayComponent>;

  // Mock questions for testing
  const mockMultipleChoiceQuestion: Question = {
    id: 'q1',
    text: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    type: 'multiple-choice',
    timeLimit: 30
  };

  const mockTextInputQuestion: Question = {
    id: 'q2',
    text: 'What is the largest planet in our solar system?',
    options: [],
    type: 'text-input',
    timeLimit: 30
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        QuestionDisplayComponent,
        FormsModule
      ]
    });

    fixture = TestBed.createComponent(QuestionDisplayComponent);
    component = fixture.componentInstance;
    
    // Default to multiple choice question
    component.question = mockMultipleChoiceQuestion;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the question text', () => {
    const questionTextElement = fixture.debugElement.query(By.css('.question-text h3'));
    expect(questionTextElement.nativeElement.textContent).toBe('What is the capital of France?');
  });

  describe('Multiple choice questions', () => {
    it('should display all options', () => {
      const optionElements = fixture.debugElement.queryAll(By.css('.option'));
      expect(optionElements.length).toBe(4);
      
      expect(optionElements[0].nativeElement.textContent.trim()).toBe('London');
      expect(optionElements[1].nativeElement.textContent.trim()).toBe('Paris');
      expect(optionElements[2].nativeElement.textContent.trim()).toBe('Berlin');
      expect(optionElements[3].nativeElement.textContent.trim()).toBe('Madrid');
    });

    it('should select an option when clicked', () => {
      const optionElements = fixture.debugElement.queryAll(By.css('.option'));
      optionElements[1].nativeElement.click(); // Click on 'Paris'
      fixture.detectChanges();
      
      expect(component.selectedOption).toBe('Paris');
      expect(optionElements[1].classes['selected']).toBe(true);
    });

    it('should not allow selection when submission is not allowed', () => {
      component.isSubmissionAllowed = false;
      fixture.detectChanges();
      
      const optionElements = fixture.debugElement.queryAll(By.css('.option'));
      optionElements[1].nativeElement.click(); // Try to click on 'Paris'
      fixture.detectChanges();
      
      expect(component.selectedOption).toBeNull();
    });

    it('should not allow selection after answer is submitted', () => {
      // First select an option
      const optionElements = fixture.debugElement.queryAll(By.css('.option'));
      optionElements[1].nativeElement.click(); // Click on 'Paris'
      fixture.detectChanges();
      
      // Submit the answer
      const submitButton = fixture.debugElement.query(By.css('.submit-button'));
      submitButton.nativeElement.click();
      fixture.detectChanges();
      
      // Try to select another option
      optionElements[2].nativeElement.click(); // Try to click on 'Berlin'
      fixture.detectChanges();
      
      // Should still be 'Paris'
      expect(component.selectedOption).toBe('Paris');
    });
  });

  describe('Text input questions', () => {
    beforeEach(() => {
      component.question = mockTextInputQuestion;
      fixture.detectChanges();
    });

    it('should display text input field', () => {
      const inputElement = fixture.debugElement.query(By.css('.text-input'));
      expect(inputElement).toBeTruthy();
    });

    it('should bind text input to textAnswer property', () => {
      const inputElement = fixture.debugElement.query(By.css('.text-input'));
      inputElement.nativeElement.value = 'Jupiter';
      inputElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(component.textAnswer).toBe('Jupiter');
    });

    it('should disable input when submission is not allowed', () => {
      component.isSubmissionAllowed = false;
      fixture.detectChanges();
      
      const inputElement = fixture.debugElement.query(By.css('.text-input'));
      expect(inputElement.nativeElement.disabled).toBe(true);
    });

    it('should disable input after answer is submitted', () => {
      // Enter an answer
      const inputElement = fixture.debugElement.query(By.css('.text-input'));
      inputElement.nativeElement.value = 'Jupiter';
      inputElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Submit the answer
      const submitButton = fixture.debugElement.query(By.css('.submit-button'));
      submitButton.nativeElement.click();
      fixture.detectChanges();
      
      // Input should be disabled
      expect(inputElement.nativeElement.disabled).toBe(true);
    });
  });

  describe('Submit button', () => {
    it('should be disabled when no answer is selected for multiple choice', () => {
      const submitButton = fixture.debugElement.query(By.css('.submit-button'));
      expect(submitButton.nativeElement.disabled).toBe(true);
      
      // Select an option
      const optionElements = fixture.debugElement.queryAll(By.css('.option'));
      optionElements[1].nativeElement.click();
      fixture.detectChanges();
      
      // Button should be enabled
      expect(submitButton.nativeElement.disabled).toBe(false);
    });

    it('should be disabled when no text is entered for text input', () => {
      component.question = mockTextInputQuestion;
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('.submit-button'));
      expect(submitButton.nativeElement.disabled).toBe(true);
      
      // Enter text
      const inputElement = fixture.debugElement.query(By.css('.text-input'));
      inputElement.nativeElement.value = 'Jupiter';
      inputElement.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // Button should be enabled
      expect(submitButton.nativeElement.disabled).toBe(false);
    });

    it('should emit answerSelected event when clicked', () => {
      spyOn(component.answerSelected, 'emit');
      
      // Select an option
      const optionElements = fixture.debugElement.queryAll(By.css('.option'));
      optionElements[1].nativeElement.click(); // Select 'Paris'
      fixture.detectChanges();
      
      // Submit the answer
      const submitButton = fixture.debugElement.query(By.css('.submit-button'));
      submitButton.nativeElement.click();
      fixture.detectChanges();
      
      expect(component.answerSelected.emit).toHaveBeenCalledWith('Paris');
    });

    it('should show "Answer submitted!" message after submission', () => {
      // Select an option
      const optionElements = fixture.debugElement.queryAll(By.css('.option'));
      optionElements[1].nativeElement.click();
      fixture.detectChanges();
      
      // Submit the answer
      const submitButton = fixture.debugElement.query(By.css('.submit-button'));
      submitButton.nativeElement.click();
      fixture.detectChanges();
      
      // Check for message
      const submittedMessage = fixture.debugElement.query(By.css('.answer-submitted-message'));
      expect(submittedMessage).toBeTruthy();
      expect(submittedMessage.nativeElement.textContent.trim()).toBe('Answer submitted!');
    });
  });

  describe('resetState method', () => {
    it('should reset component state', () => {
      // Set up state
      component.selectedOption = 'Paris';
      component.textAnswer = 'Jupiter';
      component.isAnswerSubmitted = true;
      
      // Reset state
      component.resetState();
      
      // Check state is reset
      expect(component.selectedOption).toBeNull();
      expect(component.textAnswer).toBe('');
      expect(component.isAnswerSubmitted).toBe(false);
    });
  });
});