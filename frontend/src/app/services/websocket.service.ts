import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export interface WebSocketMessage {
  quizId: string;
  playerCount: number;
  maxPlayers: number;
  started?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private messagesSubject = new Subject<any>();
  private connectionStatus = new BehaviorSubject<boolean>(false);

  constructor() {}

  /**
   * Connects to the WebSocket server
   */
  connect(): void {
    // If already connected or connecting, don't try to connect again
    if (this.stompClient) {
      if (this.stompClient.active) {
        console.log('WebSocket already connected');
        return;
      }
      // If client exists but not active, deactivate it first
      this.stompClient.deactivate();
    }

    console.log('Connecting to WebSocket...');

    // Create and configure STOMP client
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: (msg) => {
        // Uncomment for debugging
        // console.log('STOMP debug:', msg);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    // Set up connection event handlers
    this.stompClient.onConnect = (frame) => {
      console.log('WebSocket connection established');
      this.connectionStatus.next(true);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('WebSocket error:', frame);
      this.connectionStatus.next(false);
    };

    this.stompClient.onWebSocketClose = (event) => {
      console.log('WebSocket connection closed', event);
      this.connectionStatus.next(false);
    };

    // Connect to the STOMP server
    try {
      this.stompClient.activate();
    } catch (error) {
      console.error('Error activating STOMP client:', error);
      this.connectionStatus.next(false);
    }
  }

  /**
   * Disconnects from the WebSocket server
   */
  disconnect(): void {
    if (this.stompClient) {
      try {
        console.log('Disconnecting from WebSocket...');
        this.stompClient.deactivate();
        this.connectionStatus.next(false);
      } catch (error) {
        console.error('Error disconnecting from WebSocket:', error);
      } finally {
        this.stompClient = null;
      }
    }
  }

  /**
   * Returns an observable that emits quiz updates for a specific quiz
   * 
   * @param quizId The ID of the quiz to get updates for
   * @returns An observable of quiz updates
   */
  getQuizUpdates(quizId: string): Observable<WebSocketMessage> {
    // Create a new subject for this specific quiz
    const quizSubject = new Subject<WebSocketMessage>();

    // Always wait for the connection status to be true before subscribing
    // This ensures we don't try to subscribe before the connection is fully established
    const subscription = this.connectionStatus.subscribe(connected => {
      if (connected && this.stompClient) {
        try {
          this.subscribeToQuizTopic(quizId, quizSubject);
        } catch (error) {
          console.error('Error subscribing to quiz topic:', error);
          // If there's an error, try to reconnect
          this.connect();
        }
        subscription.unsubscribe();
      }
    });

    return quizSubject.asObservable();
  }

  /**
   * Subscribes to a specific quiz topic
   * 
   * @param quizId The ID of the quiz to subscribe to
   * @param subject The subject to push messages to
   */
  private subscribeToQuizTopic(quizId: string, subject: Subject<WebSocketMessage>): void {
    if (!this.stompClient) {
      console.error('STOMP client is not initialized');
      return;
    }

    if (!this.stompClient.active) {
      console.error('STOMP client is not active');
      // Try to reconnect
      this.connect();
      return;
    }

    try {
      const subscription = this.stompClient.subscribe(`/topic/quiz/${quizId}/updates`, message => {
        if (message.body) {
          try {
            const data = JSON.parse(message.body);
            subject.next({
              quizId: data.quizId,
              playerCount: data.playerCount,
              maxPlayers: data.maxPlayers,
              started: data.started
            });
          } catch (error) {
            console.error('Error parsing message body:', error);
          }
        }
      });

      // Handle unsubscription when the subject is completed
      subject.subscribe({
        complete: () => {
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.error('Error unsubscribing from topic:', error);
          }
        }
      });
    } catch (error) {
      console.error(`Error subscribing to topic /topic/quiz/${quizId}/updates:`, error);
      // Try to reconnect
      this.connect();
    }
  }

  /**
   * Returns an observable that emits the connection status
   * 
   * @returns An observable of the connection status
   */
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }
}
