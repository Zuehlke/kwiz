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
   * Starts a quiz.
   * 
   * @param quizId The ID of the quiz to start
   * @returns An observable of the quiz details
   */
  startQuiz(quizId: string): Observable<QuizDetails> {
    return this.http.post<QuizDetails>(`${this.apiUrl}/${quizId}/start`, {});
  }
}
