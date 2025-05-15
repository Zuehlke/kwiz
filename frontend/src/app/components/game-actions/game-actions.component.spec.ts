import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameActionsComponent } from './game-actions.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { QuizService } from '../../services/quiz.service';
import { of } from 'rxjs';

describe('GameActionsComponent', () => {
  let component: GameActionsComponent;
  let fixture: ComponentFixture<GameActionsComponent>;
  let quizService: jasmine.SpyObj<QuizService>;

  beforeEach(() => {
    const quizServiceSpy = jasmine.createSpyObj('QuizService', ['createQuiz', 'joinQuiz']);

    TestBed.configureTestingModule({
      imports: [
        GameActionsComponent,
        FormsModule
      ],
      providers: [
        { provide: QuizService, useValue: quizServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    fixture = TestBed.createComponent(GameActionsComponent);
    component = fixture.componentInstance;
    quizService = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the create quiz tab by default', () => {
    expect(component.activeTab()).toBe('create');
    const createTabPane = fixture.debugElement.query(By.css('#create'));
    expect(createTabPane).toBeTruthy();
    const joinTabPane = fixture.debugElement.query(By.css('#join'));
    expect(joinTabPane).toBeFalsy();
  });

  it('should switch to join tab when clicked', () => {
    const joinTabButton = fixture.debugElement.queryAll(By.css('.tab-button'))[1];
    joinTabButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.activeTab()).toBe('join');
    const createTabPane = fixture.debugElement.query(By.css('#create'));
    expect(createTabPane).toBeFalsy();
    const joinTabPane = fixture.debugElement.query(By.css('#join'));
    expect(joinTabPane).toBeTruthy();
  });

  it('should have a form for creating a quiz with required fields', () => {
    const createForm = fixture.debugElement.query(By.css('#create form'));
    expect(createForm).toBeTruthy();

    const quizNameInput = createForm.query(By.css('#quizName'));
    expect(quizNameInput).toBeTruthy();

    const submitButton = createForm.query(By.css('button[type="submit"]'));
    expect(submitButton).toBeTruthy();
    expect(submitButton.nativeElement.textContent).toContain('Create Quiz');
  });

  it('should have a form for joining a quiz with required fields', () => {
    // Switch to join tab
    component.setActiveTab('join');
    fixture.detectChanges();

    const joinForm = fixture.debugElement.query(By.css('#join form'));
    expect(joinForm).toBeTruthy();

    const quizIdInput = joinForm.query(By.css('#quizId'));
    expect(quizIdInput).toBeTruthy();

    const playerNameInput = joinForm.query(By.css('#playerName'));
    expect(playerNameInput).toBeTruthy();

    const submitButton = joinForm.query(By.css('button[type="submit"]'));
    expect(submitButton).toBeTruthy();
    expect(submitButton.nativeElement.textContent).toContain('Join Quiz');
  });

  it('should show error when creating quiz without a name', () => {
    component.quizName.set('');

    const createForm = fixture.debugElement.query(By.css('#create form'));
    const submitButton = createForm.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('Please enter a quiz name');
  });

  it('should show error when joining quiz without quiz ID', () => {
    component.setActiveTab('join');
    fixture.detectChanges();

    component.quizId.set('');
    component.playerName.set('Player 1');

    const joinForm = fixture.debugElement.query(By.css('#join form'));
    const submitButton = joinForm.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('Please enter a quiz ID');
  });

  it('should show error when joining quiz without player name', () => {
    component.setActiveTab('join');
    fixture.detectChanges();

    component.quizId.set('quiz123');
    component.playerName.set('');

    const joinForm = fixture.debugElement.query(By.css('#join form'));
    const submitButton = joinForm.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('Please enter a team name');
  });

  it('should call createQuiz service when form is submitted', () => {
    component.quizName.set('Test Quiz');
    quizService.createQuiz.and.returnValue(of({ quizId: 'quiz123', quizName: 'Test Quiz', maxPlayers: 10 }));

    const createForm = fixture.debugElement.query(By.css('#create form'));
    const submitButton = createForm.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    expect(quizService.createQuiz).toHaveBeenCalled();
    expect(component.errorMessage()).toContain('Quiz created successfully');
  });

  it('should call joinQuiz service when form is submitted', () => {
    component.setActiveTab('join');
    fixture.detectChanges();

    component.quizId.set('quiz123');
    component.playerName.set('Player 1');
    quizService.joinQuiz.and.returnValue(of({ quizId: 'quiz123', playerId: 'player123', playerName: 'Player 1', redirectUrl: '/quiz/quiz123' }));

    const joinForm = fixture.debugElement.query(By.css('#join form'));
    const submitButton = joinForm.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    expect(quizService.joinQuiz).toHaveBeenCalledWith('quiz123', { playerName: 'Player 1' });
    expect(component.errorMessage()).toContain('Joined quiz successfully');
  });
});
