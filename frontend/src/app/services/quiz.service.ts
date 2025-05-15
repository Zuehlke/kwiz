import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateQuizRequest {
  quizId: string;
  quizName: string;
  maxPlayers: number;
}

export interface CreateQuizResponse {
  quizId: string;
  quizName: string;
  maxPlayers: number;
}

export interface JoinQuizRequest {
  playerName: string;
}

export interface JoinQuizResponse {
  quizId: string;
  playerId: string;
  playerName: string;
  redirectUrl: string;
}

export interface QuizDetails {
  quizId: string;
  quizName: string;
  maxPlayers: number;
  started: boolean;
  ended: boolean;
  playerCount: number;
}

export interface CreateRoundRequest {
  roundName: string;
}

export interface Round {
  roundId: string;
  roundName: string;
  active: boolean;
  completed: boolean;
  questionCount: number;
}

export interface SubmitQuestionRequest {
  questionText: string;
  correctAnswers: string[];
  timeLimit: number;
  roundId?: string;
}

export interface SubmitQuestionResponse {
  questionId: string;
  questionText: string;
  correctAnswers: string[];
  timeLimit: number;
  roundId?: string;
}

export interface PlayerQuestion {
  questionId: string;
  questionText: string;
  correctAnswers: string[];
  timeLimit: number;
  roundId: string;
  roundName: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = '/api/quizzes';

  constructor(private http: HttpClient) { }

  /**
   * Creates a new quiz.
   * 
   * @param request The quiz creation request
   * @returns An observable of the created quiz
   */
  createQuiz(request: CreateQuizRequest): Observable<CreateQuizResponse> {
    return this.http.post<CreateQuizResponse>(this.apiUrl, request);
  }

  /**
   * Gets a quiz by ID.
   * 
   * @param quizId The ID of the quiz to get
   * @returns An observable of the quiz details
   */
  getQuiz(quizId: string): Observable<QuizDetails> {
    return this.http.get<QuizDetails>(`${this.apiUrl}/${quizId}`);
  }

  /**
   * Joins a quiz.
   * 
   * @param quizId The ID of the quiz to join
   * @param request The join request
   * @returns An observable of the join response
   */
  joinQuiz(quizId: string, request: JoinQuizRequest): Observable<JoinQuizResponse> {
    return this.http.post<JoinQuizResponse>(`${this.apiUrl}/${quizId}/players`, request);
  }

  /**
   * Submits a participant question to a quiz.
   *
   * @param quizId The ID of the quiz
   * @param playerId The ID of the player submitting the question
   * @param request The question submission request
   * @returns An observable of the submitted question
   */
  submitQuestion(quizId: string, playerId: string, request: SubmitQuestionRequest): Observable<SubmitQuestionResponse> {
    return this.http.post<SubmitQuestionResponse>(`${this.apiUrl}/${quizId}/players/${playerId}/questions`, request);
  }

  /**
   * Gets all questions submitted by a player in a quiz.
   *
   * @param quizId The ID of the quiz
   * @param playerId The ID of the player
   * @returns An observable of the player's submitted questions
   */
  getPlayerSubmittedQuestions(quizId: string, playerId: string): Observable<PlayerQuestion[]> {
    return this.http.get<PlayerQuestion[]>(`${this.apiUrl}/${quizId}/players/${playerId}/questions`);
  }

  /**
   * Starts a quiz.
   *
   * @param quizId The ID of the quiz to start
   * @returns An observable of the quiz details
   */
  startQuiz(quizId: string): Observable<QuizDetails> {
    return this.http.post<QuizDetails>(`${this.apiUrl}/${quizId}/start`, {});
  }

  /**
   * Creates a new round in a quiz.
   *
   * @param quizId The ID of the quiz
   * @param request The round creation request
   * @returns An observable of the created round
   */
  createRound(quizId: string, request: CreateRoundRequest): Observable<Round> {
    return this.http.post<Round>(`${this.apiUrl}/${quizId}/rounds`, request);
  }

  /**
   * Gets all rounds in a quiz.
   *
   * @param quizId The ID of the quiz
   * @returns An observable of the rounds in the quiz
   */
  getRounds(quizId: string): Observable<Round[]> {
    return this.http.get<Round[]>(`${this.apiUrl}/${quizId}/rounds`);
  }
}
