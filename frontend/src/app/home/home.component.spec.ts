import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { GameActionsComponent } from '../components/game-actions/game-actions.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        GameActionsComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should include the game-actions component', () => {
    const gameActionsComponent = fixture.debugElement.query(By.directive(GameActionsComponent));
    expect(gameActionsComponent).toBeTruthy();
  });
});

  it('should have a form for creating a quiz with required fields', () => {
    component.showCreateQuizForm = true;
    fixture.detectChanges();

    const createForm = fixture.debugElement.query(By.css('form.create-quiz-form'));
    expect(createForm).toBeTruthy();

    const quizNameInput = createForm.query(By.css('input[formControlName="quizName"]'));
    expect(quizNameInput).toBeTruthy();

    const maxPlayersInput = createForm.query(By.css('input[formControlName="maxPlayers"]'));
    expect(maxPlayersInput).toBeTruthy();

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

    const playerNameInput = joinForm.query(By.css('input[formControlName="playerName"]'));
    expect(playerNameInput).toBeTruthy();

    const submitButton = joinForm.query(By.css('button[type="submit"]'));
    expect(submitButton).toBeTruthy();
  });
});
