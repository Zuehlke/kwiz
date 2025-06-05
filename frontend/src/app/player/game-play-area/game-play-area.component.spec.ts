import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamePlayAreaComponent } from './game-play-area.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GameService } from '../../services/game.service';
import { WebSocketService } from '../../services/websocket.service';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { TimerDisplayComponent } from '../timer-display/timer-display.component';
import { ScoreDisplayComponent } from '../score-display/score-display.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GameStateDTO } from '../../types/game.types';

describe('GamePlayAreaComponent', () => {
  let component: GamePlayAreaComponent;
  let fixture: ComponentFixture<GamePlayAreaComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;

  // Mock game state
  const mockGameState: GameStateDTO = {
    gameId: 'game123',
    status: 'IN_PROGRESS',
    currentQuestionId: 'q1',
    currentQuestionText: 'What is the capital of France?',
    remainingSeconds: 30,
    acceptingAnswers: true,
    players: [
      { playerId: 'player1', displayName: 'Alice', score: 100 },
      { playerId: 'player2', displayName: 'Bob', score: 85 }
    ],
    playersAnswered: 1,
    fastestAnswerTime: 2.5
  };

  beforeEach(() => {
    // Create spies for the services
    gameServiceSpy = jasmine.createSpyObj('GameService', ['submitAnswer', 'adminAdvanceToNextQuestion']);
    gameServiceSpy.submitAnswer.and.returnValue(of({}));
    gameServiceSpy.adminAdvanceToNextQuestion.and.returnValue(of({}));

    webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['connect', 'getGameStateUpdates']);
    webSocketServiceSpy.connect.and.returnValue();
    webSocketServiceSpy.getGameStateUpdates.and.returnValue(of(mockGameState));

    // Mock session storage
    spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({
      playerId: 'player1',
      playerName: 'Alice'
    }));

    TestBed.configureTestingModule({
      imports: [
        GamePlayAreaComponent,
        FormsModule
      ],
      providers: [
        { provide: GameService, useValue: gameServiceSpy },
        { provide: WebSocketService, useValue: webSocketServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (param: string) => param === 'quizId' ? 'quiz123' : param === 'gameId' ? 'game123' : null
            })
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA] // This allows us to ignore unknown elements like child components
    });

    fixture = TestBed.createComponent(GamePlayAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize player data from session storage', () => {
    expect(component.currentPlayer).toEqual({
      playerId: 'player1',
      playerName: 'Alice'
    });
  });

  it('should connect to WebSocket and subscribe to game state updates', () => {
    expect(webSocketServiceSpy.connect).toHaveBeenCalled();
    expect(webSocketServiceSpy.getGameStateUpdates).toHaveBeenCalledWith('game123');
  });

  it('should process game state updates', () => {
    // The component should have processed the mock game state
    expect(component.gameState).toEqual(mockGameState);
    expect(component.currentQuestion).toBeTruthy();
    expect(component.currentQuestion?.text).toBe('What is the capital of France?');
    expect(component.totalPlayers).toBe(2);
    expect(component.playersAnswered).toBe(1);
    expect(component.fastestAnswerTime).toBe(2.5);
  });

  it('should create leaderboard from players in game state', () => {
    expect(component.leaderboard.length).toBe(2);
    expect(component.leaderboard[0].playerName).toBe('Alice');
    expect(component.leaderboard[0].score).toBe(100);
    expect(component.leaderboard[1].playerName).toBe('Bob');
    expect(component.leaderboard[1].score).toBe(85);
  });

  it('should handle answer submission', () => {
    // Set up the component state
    component.currentQuestion = {
      id: 'q1',
      text: 'What is the capital of France?',
      options: [],
      type: 'text-input',
      timeLimit: 30
    };
    component.gameState = { ...mockGameState, acceptingAnswers: true };
    component.answerSubmitted = false;
    component.answerStartTime = Date.now() - 5000; // 5 seconds ago
    
    // Submit an answer
    component.onAnswerSelected('Paris');
    
    // Verify the answer was submitted
    expect(component.playerAnswer).toBe('Paris');
    expect(component.answerSubmitted).toBe(true);
    expect(component.answerTime).toBeGreaterThan(0); // Should have calculated time
    
    // Verify the service was called
    expect(gameServiceSpy.submitAnswer).toHaveBeenCalledWith(
      'game123',
      'player1',
      'q1',
      'Paris'
    );
  });

  it('should not submit answer if already submitted', () => {
    // Set up the component state
    component.currentQuestion = {
      id: 'q1',
      text: 'What is the capital of France?',
      options: [],
      type: 'text-input',
      timeLimit: 30
    };
    component.gameState = { ...mockGameState, acceptingAnswers: true };
    component.answerSubmitted = true; // Already submitted
    
    // Try to submit an answer
    component.onAnswerSelected('Paris');
    
    // Verify the answer was not submitted
    expect(gameServiceSpy.submitAnswer).not.toHaveBeenCalled();
  });

  it('should not submit answer if not accepting answers', () => {
    // Set up the component state
    component.currentQuestion = {
      id: 'q1',
      text: 'What is the capital of France?',
      options: [],
      type: 'text-input',
      timeLimit: 30
    };
    component.gameState = { ...mockGameState, acceptingAnswers: false }; // Not accepting answers
    component.answerSubmitted = false;
    
    // Try to submit an answer
    component.onAnswerSelected('Paris');
    
    // Verify the answer was not submitted
    expect(gameServiceSpy.submitAnswer).not.toHaveBeenCalled();
  });

  it('should reset answer when a new question is detected', () => {
    // Set up initial state
    component.playerAnswer = 'Paris';
    component.answerSubmitted = true;
    component.answerTime = 5.0;
    component.currentQuestion = {
      id: 'q1',
      text: 'What is the capital of France?',
      options: [],
      type: 'text-input',
      timeLimit: 30
    };
    
    // Process a new game state with a different question
    const newGameState: GameStateDTO = {
      ...mockGameState,
      currentQuestionId: 'q2',
      currentQuestionText: 'What is the largest planet?'
    };
    
    // Call the private method directly using type assertion
    (component as any).processGameState(newGameState);
    
    // Verify the answer was reset
    expect(component.playerAnswer).toBeNull();
    expect(component.answerSubmitted).toBe(false);
    expect(component.answerTime).toBeNull();
    expect(component.currentQuestion?.id).toBe('q2');
    expect(component.currentQuestion?.text).toBe('What is the largest planet?');
  });

  it('should get current player score from game state', () => {
    // Alice has a score of 100 in the mock game state
    expect(component.getCurrentPlayerScore()).toBe(100);
    
    // Change the player ID to one that doesn't exist
    component.currentPlayer = { playerId: 'nonexistent', playerName: 'Nobody' };
    expect(component.getCurrentPlayerScore()).toBe(0);
  });

  it('should handle admin next question action when in admin mode', () => {
    // Set up component in admin mode
    component.isAdminMode = true;
    component.gameState = { ...mockGameState, status: 'QUESTION_CLOSED' };
    
    // Call the next question method
    component.onNextQuestion();
    
    // Verify the service was called
    expect(gameServiceSpy.adminAdvanceToNextQuestion).toHaveBeenCalledWith('game123');
  });

  it('should not handle admin next question action when not in admin mode', () => {
    // Set up component not in admin mode
    component.isAdminMode = false;
    component.gameState = { ...mockGameState, status: 'QUESTION_CLOSED' };
    
    // Call the next question method
    component.onNextQuestion();
    
    // Verify the service was not called
    expect(gameServiceSpy.adminAdvanceToNextQuestion).not.toHaveBeenCalled();
  });

  it('should clean up subscriptions on destroy', () => {
    // Create a spy for the subscription
    const subscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['gameStateSubscription'] = subscriptionSpy;
    
    // Call ngOnDestroy
    component.ngOnDestroy();
    
    // Verify the subscription was unsubscribed
    expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
  });
});