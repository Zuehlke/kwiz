import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { QuizService } from '../services/quiz.service';
import { WebSocketService } from '../services/websocket.service';
import { GameService } from '../services/game.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { JoinQuizInfoComponent } from '../shared/join-quiz-info/join-quiz-info.component';
import { GamePlayAreaComponent } from '../player/game-play-area/game-play-area.component';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let quizService: jasmine.SpyObj<QuizService>;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let gameService: jasmine.SpyObj<GameService>;

  beforeEach(() => {
    const quizServiceSpy = jasmine.createSpyObj('QuizService', ['getQuiz', 'updateMaxPlayers', 'startQuiz']);
    const webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['connect', 'disconnect', 'getConnectionStatus', 'getQuizUpdates', 'getGameStateUpdates']);
    const gameServiceSpy = jasmine.createSpyObj('GameService', ['fetchGameState']);

    // Mock the observables returned by the service methods
    webSocketServiceSpy.getConnectionStatus.and.returnValue(of(true));
    webSocketServiceSpy.getQuizUpdates.and.returnValue(of({
      playerCount: 0,
      maxPlayers: 10,
      started: false,
      players: []
    }));
    webSocketServiceSpy.getGameStateUpdates.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [
        AdminComponent,
        FormsModule,
        RouterTestingModule,
        JoinQuizInfoComponent,
        GamePlayAreaComponent
      ],
      providers: [
        { provide: QuizService, useValue: quizServiceSpy },
        { provide: WebSocketService, useValue: webSocketServiceSpy },
        { provide: GameService, useValue: gameServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'quiz123'
              }
            }
          }
        },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    quizService = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
    webSocketService = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
    gameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;

    // Mock the getQuiz method to return a quiz
    quizService.getQuiz.and.returnValue(of({
      quizId: 'quiz123',
      quizName: 'Test Quiz',
      maxPlayers: 10,
      started: false,
      ended: false,
      playerCount: 0,
      currentGameId: null
    }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with quiz details', () => {
    expect(component.quizId).toBe('quiz123');
    expect(component.quizDetails).toBeTruthy();
    expect(component.quizDetails?.maxPlayers).toBe(10);
    expect(component.maxPlayers).toBe(10);
  });

  it('should update max players successfully', () => {
    // Arrange
    const newMaxPlayers = 20;
    component.maxPlayers = newMaxPlayers;
    
    quizService.updateMaxPlayers.and.returnValue(of({
      quizId: 'quiz123',
      quizName: 'Test Quiz',
      maxPlayers: newMaxPlayers,
      started: false,
      ended: false,
      playerCount: 0,
      currentGameId: null
    }));

    // Act
    component.updateMaxPlayers();
    
    // Assert
    expect(quizService.updateMaxPlayers).toHaveBeenCalledWith('quiz123', newMaxPlayers);
    expect(component.quizDetails?.maxPlayers).toBe(newMaxPlayers);
    expect(component.isUpdatingMaxPlayers).toBe(false);
    expect(component.updateMaxPlayersError).toBeNull();
  });

  it('should handle error when updating max players', () => {
    // Arrange
    const newMaxPlayers = 20;
    component.maxPlayers = newMaxPlayers;
    
    const errorResponse = {
      error: {
        error: 'Cannot update maximum players after quiz has started'
      }
    };
    quizService.updateMaxPlayers.and.returnValue(throwError(() => errorResponse));

    // Act
    component.updateMaxPlayers();
    
    // Assert
    expect(quizService.updateMaxPlayers).toHaveBeenCalledWith('quiz123', newMaxPlayers);
    expect(component.isUpdatingMaxPlayers).toBe(false);
    expect(component.updateMaxPlayersError).toBe('Cannot update maximum players after quiz has started');
    
    // Should reset maxPlayers to the current value from quizDetails
    expect(component.maxPlayers).toBe(10);
  });

  it('should not update max players when quizId is null', () => {
    // Arrange
    component.quizId = null;
    
    // Act
    component.updateMaxPlayers();
    
    // Assert
    expect(quizService.updateMaxPlayers).not.toHaveBeenCalled();
  });
});