import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a section for creating a new quiz', () => {
    const createQuizSection = fixture.debugElement.query(By.css('.create-quiz-section'));
    expect(createQuizSection).toBeTruthy();
    
    const createQuizButton = createQuizSection.query(By.css('button'));
    expect(createQuizButton).toBeTruthy();
    expect(createQuizButton.nativeElement.textContent).toContain('Create Quiz');
  });

  it('should have a section for joining an existing quiz', () => {
    const joinQuizSection = fixture.debugElement.query(By.css('.join-quiz-section'));
    expect(joinQuizSection).toBeTruthy();
    
    const joinQuizButton = joinQuizSection.query(By.css('button'));
    expect(joinQuizButton).toBeTruthy();
    expect(joinQuizButton.nativeElement.textContent).toContain('Join Quiz');
  });

  it('should have a form for creating a quiz with required fields', () => {
    component.showCreateQuizForm = true;
    fixture.detectChanges();
    
    const createForm = fixture.debugElement.query(By.css('form.create-quiz-form'));
    expect(createForm).toBeTruthy();
    
    const quizNameInput = createForm.query(By.css('input[formControlName="quizName"]'));
    expect(quizNameInput).toBeTruthy();
    
    const maxParticipantsInput = createForm.query(By.css('input[formControlName="maxParticipants"]'));
    expect(maxParticipantsInput).toBeTruthy();
    
    const submitButton = createForm.query(By.css('button[type="submit"]'));
    expect(submitButton).toBeTruthy();
  });

  it('should have a form for joining a quiz with required fields', () => {
    component.showJoinQuizForm = true;
    fixture.detectChanges();
    
    const joinForm = fixture.debugElement.query(By.css('form.join-quiz-form'));
    expect(joinForm).toBeTruthy();
    
    const quizIdInput = joinForm.query(By.css('input[formControlName="quizId"]'));
    expect(quizIdInput).toBeTruthy();
    
    const participantNameInput = joinForm.query(By.css('input[formControlName="participantName"]'));
    expect(participantNameInput).toBeTruthy();
    
    const submitButton = joinForm.query(By.css('button[type="submit"]'));
    expect(submitButton).toBeTruthy();
  });
});