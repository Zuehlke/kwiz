package ch.zuhlke.camp.kwiz.controller;

import ch.zuhlke.camp.kwiz.domain.GameEngine;
import ch.zuhlke.camp.kwiz.domain.Player;
import ch.zuhlke.camp.kwiz.domain.Quiz;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class QuizControllerTest {

    @Mock
    private GameEngine gameEngine;

    private QuizController quizController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        quizController = new QuizController(gameEngine);
    }

    @Test
    void updateMaxPlayers_shouldUpdateMaxPlayersSuccessfully() {
        // Arrange
        String quizId = "quiz123";
        String quizName = "Test Quiz";
        int initialMaxPlayers = 5;
        int newMaxPlayers = 10;
        
        Quiz quiz = mock(Quiz.class);
        Quiz updatedQuiz = mock(Quiz.class);
        
        when(gameEngine.updateMaxPlayers(quizId, newMaxPlayers)).thenReturn(updatedQuiz);
        when(updatedQuiz.getId()).thenReturn(quizId);
        when(updatedQuiz.getName()).thenReturn(quizName);
        when(updatedQuiz.getMaxPlayers()).thenReturn(newMaxPlayers);
        when(updatedQuiz.isStarted()).thenReturn(false);
        when(updatedQuiz.isEnded()).thenReturn(false);
        when(updatedQuiz.getPlayers()).thenReturn(new ArrayList<>());
        when(updatedQuiz.getCurrentGameId()).thenReturn(null);
        
        QuizController.UpdateMaxPlayersRequest request = new QuizController.UpdateMaxPlayersRequest();
        request.setMaxPlayers(newMaxPlayers);
        
        // Act
        ResponseEntity<Map<String, Object>> response = quizController.updateMaxPlayers(quizId, request);
        
        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody);
        assertEquals(quizId, responseBody.get("quizId"));
        assertEquals(quizName, responseBody.get("quizName"));
        assertEquals(newMaxPlayers, responseBody.get("maxPlayers"));
        assertEquals(false, responseBody.get("started"));
        assertEquals(false, responseBody.get("ended"));
        assertEquals(0, responseBody.get("playerCount"));
        assertNull(responseBody.get("currentGameId"));
        
        verify(gameEngine).updateMaxPlayers(quizId, newMaxPlayers);
    }
    
    @Test
    void updateMaxPlayers_shouldReturnNotFoundWhenQuizDoesNotExist() {
        // Arrange
        String quizId = "nonexistent";
        int newMaxPlayers = 10;
        
        when(gameEngine.updateMaxPlayers(quizId, newMaxPlayers))
            .thenThrow(new IllegalArgumentException("No quiz found with ID: " + quizId));
        
        QuizController.UpdateMaxPlayersRequest request = new QuizController.UpdateMaxPlayersRequest();
        request.setMaxPlayers(newMaxPlayers);
        
        // Act
        ResponseEntity<Map<String, Object>> response = quizController.updateMaxPlayers(quizId, request);
        
        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        
        verify(gameEngine).updateMaxPlayers(quizId, newMaxPlayers);
    }
    
    @Test
    void updateMaxPlayers_shouldReturnConflictWhenQuizHasStarted() {
        // Arrange
        String quizId = "quiz123";
        int newMaxPlayers = 10;
        
        when(gameEngine.updateMaxPlayers(quizId, newMaxPlayers))
            .thenThrow(new IllegalStateException("Cannot update maximum players after quiz has started"));
        
        QuizController.UpdateMaxPlayersRequest request = new QuizController.UpdateMaxPlayersRequest();
        request.setMaxPlayers(newMaxPlayers);
        
        // Act
        ResponseEntity<Map<String, Object>> response = quizController.updateMaxPlayers(quizId, request);
        
        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody);
        assertEquals("Cannot update maximum players after quiz has started", responseBody.get("error"));
        
        verify(gameEngine).updateMaxPlayers(quizId, newMaxPlayers);
    }
    
    @Test
    void updateMaxPlayers_shouldReturnConflictWhenNewMaxIsLessThanCurrentPlayerCount() {
        // Arrange
        String quizId = "quiz123";
        int newMaxPlayers = 2;
        
        when(gameEngine.updateMaxPlayers(quizId, newMaxPlayers))
            .thenThrow(new IllegalArgumentException("New maximum players cannot be less than current player count"));
        
        QuizController.UpdateMaxPlayersRequest request = new QuizController.UpdateMaxPlayersRequest();
        request.setMaxPlayers(newMaxPlayers);
        
        // Act
        ResponseEntity<Map<String, Object>> response = quizController.updateMaxPlayers(quizId, request);
        
        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        
        Map<String, Object> responseBody = response.getBody();
        assertNotNull(responseBody);
        assertEquals("New maximum players cannot be less than current player count", responseBody.get("error"));
        
        verify(gameEngine).updateMaxPlayers(quizId, newMaxPlayers);
    }
}