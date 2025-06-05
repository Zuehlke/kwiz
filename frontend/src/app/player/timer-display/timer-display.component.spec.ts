import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerDisplayComponent } from './timer-display.component';
import { By } from '@angular/platform-browser';

describe('TimerDisplayComponent', () => {
  let component: TimerDisplayComponent;
  let fixture: ComponentFixture<TimerDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TimerDisplayComponent
      ]
    });

    fixture = TestBed.createComponent(TimerDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the formatted time', () => {
    component.timeRemaining = 75; // 1 minute and 15 seconds
    fixture.detectChanges();
    
    const timerTextElement = fixture.debugElement.query(By.css('.timer-text'));
    expect(timerTextElement.nativeElement.textContent.trim()).toBe('01:15');
  });

  it('should format time with leading zeros', () => {
    component.timeRemaining = 5; // 5 seconds
    fixture.detectChanges();
    
    const timerTextElement = fixture.debugElement.query(By.css('.timer-text'));
    expect(timerTextElement.nativeElement.textContent.trim()).toBe('00:05');
  });

  it('should calculate progress percentage correctly', () => {
    component.timeRemaining = 30; // 30 seconds (50% of 60 seconds)
    component.ngOnChanges({ timeRemaining: { currentValue: 30, previousValue: 0, firstChange: false, isFirstChange: () => false } });
    fixture.detectChanges();
    
    const progressBarElement = fixture.debugElement.query(By.css('.timer-progress-bar'));
    expect(progressBarElement.styles['width.%']).toBe('50');
  });

  it('should set green color when time remaining is more than 15 seconds', () => {
    component.timeRemaining = 30; // 30 seconds
    component.ngOnChanges({ timeRemaining: { currentValue: 30, previousValue: 0, firstChange: false, isFirstChange: () => false } });
    fixture.detectChanges();
    
    const progressBarElement = fixture.debugElement.query(By.css('.timer-progress-bar'));
    const timerTextElement = fixture.debugElement.query(By.css('.timer-text'));
    
    expect(progressBarElement.styles['background-color']).toBe('#4caf50'); // Green
    expect(timerTextElement.styles['color']).toBe('#4caf50'); // Green
  });

  it('should set orange color when time remaining is between 5 and 15 seconds', () => {
    component.timeRemaining = 10; // 10 seconds
    component.ngOnChanges({ timeRemaining: { currentValue: 10, previousValue: 0, firstChange: false, isFirstChange: () => false } });
    fixture.detectChanges();
    
    const progressBarElement = fixture.debugElement.query(By.css('.timer-progress-bar'));
    const timerTextElement = fixture.debugElement.query(By.css('.timer-text'));
    
    expect(progressBarElement.styles['background-color']).toBe('#ff9800'); // Orange
    expect(timerTextElement.styles['color']).toBe('#ff9800'); // Orange
  });

  it('should set red color when time remaining is 5 seconds or less', () => {
    component.timeRemaining = 5; // 5 seconds
    component.ngOnChanges({ timeRemaining: { currentValue: 5, previousValue: 0, firstChange: false, isFirstChange: () => false } });
    fixture.detectChanges();
    
    const progressBarElement = fixture.debugElement.query(By.css('.timer-progress-bar'));
    const timerTextElement = fixture.debugElement.query(By.css('.timer-text'));
    
    expect(progressBarElement.styles['background-color']).toBe('#f44336'); // Red
    expect(timerTextElement.styles['color']).toBe('#f44336'); // Red
  });

  it('should update display when timeRemaining changes', () => {
    // Initial state
    component.timeRemaining = 30;
    component.ngOnChanges({ timeRemaining: { currentValue: 30, previousValue: 0, firstChange: false, isFirstChange: () => false } });
    fixture.detectChanges();
    
    let timerTextElement = fixture.debugElement.query(By.css('.timer-text'));
    expect(timerTextElement.nativeElement.textContent.trim()).toBe('00:30');
    
    // Change time remaining
    component.timeRemaining = 10;
    component.ngOnChanges({ timeRemaining: { currentValue: 10, previousValue: 30, firstChange: false, isFirstChange: () => false } });
    fixture.detectChanges();
    
    timerTextElement = fixture.debugElement.query(By.css('.timer-text'));
    expect(timerTextElement.nativeElement.textContent.trim()).toBe('00:10');
    
    // Verify color change
    const progressBarElement = fixture.debugElement.query(By.css('.timer-progress-bar'));
    expect(progressBarElement.styles['background-color']).toBe('#ff9800'); // Orange
  });
});