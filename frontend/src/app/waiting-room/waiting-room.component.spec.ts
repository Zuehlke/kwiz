import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingRoomComponent } from './waiting-room.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { QuizService, QuizDetails, PlayerQuestion, Round } from '../services/quiz.service';
import { WebSocketService, WebSocketMessage } from '../services/websocket.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('WaitingRoomComponent', () => {
  let component: WaitingRoomComponent;
  let fixture: ComponentFixture<WaitingRoomComponent>;
  let quizServiceSpy: jasmine.SpyObj<QuizService>;
  let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Mock quiz details
  const mockQuizDetails: QuizDetails = {
    quizId: 'quiz123',
    quizName: 'Test Quiz',
    playerCount: 3,
    maxPlayers: 10,
    started: false,
    ended: false,
    currentGameId: null
  };

  // Mock player questions
  const mockPlayerQuestions: PlayerQuestion[] = [
    { questionId: 'q1', questionText: 'What is the capital of France?', correctAnswers: ['Paris'], timeLimit: 30, roundId: 'r1', roundName: 'Geography' },
    { questionId: 'q2', questionText: 'What is the largest planet?', correctAnswers: ['Jupiter'], timeLimit: 30, roundId: 'r1', roundName: 'Geography' },
    { questionId: 'q3', questionText: 'Who wrote Hamlet?', correctAnswers: ['Shakespeare'], timeLimit: 30, roundId: 'r2', roundName: 'Literature' }
  ];

  // Mock rounds
  const mockRounds: Round[] = [
    { roundId: 'r1', roundName: 'Geography', active: false, completed: false, questionCount: 2 },
    { roundId: 'r2', roundName: 'Literature', active: false, completed: false, questionCount: 1 },
    { roundId: 'r3', roundName: 'Science', active: false, completed: false, questionCount: 0 }
  ];

  beforeEach(() => {
    // Create spies for the services
    quizServiceSpy = jasmine.createSpyObj('QuizService', [
      'getQuiz', 
      'getPlayerSubmittedQuestions', 
      'getRounds', 
      'createRound', 
      'submitQuestion'
    ]);
    quizServiceSpy.getQuiz.and.returnValue(of(mockQuizDetails));
    quizServiceSpy.getPlayerSubmittedQuestions.and.returnValue(of(mockPlayerQuestions));
    quizServiceSpy.getRounds.and.returnValue(of(mockRounds));
    quizServiceSpy.createRound.and.returnValue(of({ 
      roundId: 'r4', 
      roundName: 'New Round',
      active: false,
      completed: false,
      questionCount: 0
    }));
    quizServiceSpy.submitQuestion.and.returnValue(of({ 
      questionId: 'q4',
      questionText: 'What is the capital of Germany?',
      correctAnswers: ['Berlin'],
      timeLimit: 30,
      roundId: 'r1'
    }));

    webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', [
      'connect', 
      'disconnect', 
      'getConnectionStatus', 
      'getQuizUpdates'
    ]);
    webSocketServiceSpy.connect.and.returnValue();
    webSocketServiceSpy.getConnectionStatus.and.returnValue(of(true));
    webSocketServiceSpy.getQuizUpdates.and.returnValue(of({
      playerCount: 3,
      maxPlayers: 10,
      started: false
    } as WebSocketMessage));

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Mock session storage
    spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({
      playerId: 'player1',
      playerName: 'Alice'
    }));

    // Mock document.getElementById
    spyOn(document, 'getElementById').and.returnValue({
      scrollIntoView: jasmine.createSpy('scrollIntoView')
    } as any);

    TestBed.configureTestingModule({
      imports: [
        WaitingRoomComponent,
        FormsModule
      ],
      providers: [
        { provide: QuizService, useValue: quizServiceSpy },
        { provide: WebSocketService, useValue: webSocketServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (param: string) => param === 'quizId' ? 'quiz123' : null
              }
            }
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA] // This allows us to ignore unknown elements like child components
    });

    fixture = TestBed.createComponent(WaitingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize quiz ID from route params', () => {
    expect(component.quizId).toBe('quiz123');
  });

  it('should initialize player ID from session storage', () => {
    expect(component.playerId).toBe('player1');
    expect(component.playerName).toBe('Alice');
  });

  it('should fetch quiz details on init', () => {
    expect(quizServiceSpy.getQuiz).toHaveBeenCalledWith('quiz123');
    expect(component.quizDetails).toEqual(mockQuizDetails);
  });

  it('should fetch submitted questions on init', () => {
    expect(quizServiceSpy.getPlayerSubmittedQuestions).toHaveBeenCalledWith('quiz123', 'player1');
    expect(component.submittedQuestions).toEqual(mockPlayerQuestions);
  });

  it('should fetch rounds on init', () => {
    expect(quizServiceSpy.getRounds).toHaveBeenCalledWith('quiz123');
    expect(component.rounds).toEqual(mockRounds);
  });

  it('should connect to WebSocket and subscribe to quiz updates', () => {
    expect(webSocketServiceSpy.connect).toHaveBeenCalled();
    expect(webSocketServiceSpy.getQuizUpdates).toHaveBeenCalledWith('quiz123');
  });

  it('should group questions by round name', () => {
    expect(Object.keys(component.groupedQuestions).length).toBe(2);
    expect(component.groupedQuestions['Geography'].length).toBe(2);
    expect(component.groupedQuestions['Literature'].length).toBe(1);
  });

  it('should get round names from grouped questions', () => {
    const roundNames = component.getRoundNames();
    expect(roundNames.length).toBe(2);
    expect(roundNames).toContain('Geography');
    expect(roundNames).toContain('Literature');
  });

  it('should navigate to player page when quiz starts', () => {
    // Simulate quiz starting
    webSocketServiceSpy.getQuizUpdates.and.returnValue(of({
      playerCount: 3,
      maxPlayers: 10,
      started: true,
      currentGameId: 'game123'
    } as WebSocketMessage));

    // Re-initialize component to trigger the subscription
    component.ngOnInit();

    // Verify navigation
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/player', 'quiz123', 'game123']);
  });

  it('should add a correct answer field', () => {
    const initialLength = component.newQuestion.correctAnswers.length;
    component.addCorrectAnswer();
    expect(component.newQuestion.correctAnswers.length).toBe(initialLength + 1);
  });

  it('should remove a correct answer field', () => {
    // Add an extra answer first
    component.newQuestion.correctAnswers = ['Answer 1', 'Answer 2'];
    component.removeCorrectAnswer(1);
    expect(component.newQuestion.correctAnswers.length).toBe(1);
    expect(component.newQuestion.correctAnswers[0]).toBe('Answer 1');
  });

  it('should not remove the last correct answer field', () => {
    component.newQuestion.correctAnswers = ['Answer 1'];
    component.removeCorrectAnswer(0);
    expect(component.newQuestion.correctAnswers.length).toBe(1);
  });

  it('should create a new round', () => {
    component.newRound.roundName = 'New Round';
    component.createRound();

    expect(quizServiceSpy.createRound).toHaveBeenCalledWith('quiz123', { roundName: 'New Round' });
    expect(component.roundCreated).toBe(true);
    expect(component.selectedRoundId).toBe('r4'); // ID from the mock response
    expect(component.newRound.roundName).toBe(''); // Should reset the form
  });

  it('should show error when creating round with empty name', () => {
    component.newRound.roundName = '';
    component.createRound();

    expect(quizServiceSpy.createRound).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Please provide a round name.');
  });

  it('should scroll to a section when scrollToSection is called', () => {
    // Mock element is already set up in the beforeEach
    component.scrollToSection('test-section');
    expect(document.getElementById).toHaveBeenCalledWith('test-section');

    // Since we've mocked document.getElementById to return an object with scrollIntoView
    // we can safely assert that scrollIntoView was called
    const mockElement = document.getElementById('test-section');
    expect(mockElement?.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should submit a question', () => {
    // Set up the form
    component.newQuestion.questionText = 'What is the capital of Germany?';
    component.newQuestion.correctAnswers = ['Berlin'];
    component.newQuestion.timeLimit = 30;
    component.selectedRoundId = 'r1';

    // Submit the question
    component.submitQuestion();

    // Verify the service was called with the correct parameters
    expect(quizServiceSpy.submitQuestion).toHaveBeenCalledWith(
      'quiz123',
      'player1',
      {
        questionText: 'What is the capital of Germany?',
        correctAnswers: ['Berlin'],
        timeLimit: 30,
        roundId: 'r1'
      }
    );

    // Verify the form was reset
    expect(component.questionSubmitted).toBe(true);
    expect(component.newQuestion.questionText).toBe('');
    expect(component.newQuestion.correctAnswers).toEqual(['']);
    expect(component.newQuestion.timeLimit).toBe(30);
  });

  it('should show error when submitting question without text', () => {
    component.newQuestion.questionText = '';
    component.newQuestion.correctAnswers = ['Berlin'];
    component.selectedRoundId = 'r1';

    component.submitQuestion();

    expect(quizServiceSpy.submitQuestion).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Please provide a question.');
  });

  it('should show error when submitting question without correct answers', () => {
    component.newQuestion.questionText = 'What is the capital of Germany?';
    component.newQuestion.correctAnswers = [''];
    component.selectedRoundId = 'r1';

    component.submitQuestion();

    expect(quizServiceSpy.submitQuestion).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Please provide at least one correct answer.');
  });

  it('should show error when submitting question without selecting a round', () => {
    component.newQuestion.questionText = 'What is the capital of Germany?';
    component.newQuestion.correctAnswers = ['Berlin'];
    component.selectedRoundId = null;

    component.submitQuestion();

    expect(quizServiceSpy.submitQuestion).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Please select a round for your question.');
  });

  it('should clean up subscriptions on destroy', () => {
    // Create spies for the subscriptions
    const playerCountSubscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    const wsConnectionSubscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);

    component['playerCountSubscription'] = playerCountSubscriptionSpy;
    component['wsConnectionSubscription'] = wsConnectionSubscriptionSpy;

    // Call ngOnDestroy
    component.ngOnDestroy();

    // Verify the subscriptions were unsubscribed
    expect(playerCountSubscriptionSpy.unsubscribe).toHaveBeenCalled();
    expect(wsConnectionSubscriptionSpy.unsubscribe).toHaveBeenCalled();
    expect(webSocketServiceSpy.disconnect).toHaveBeenCalled();
  });
});
