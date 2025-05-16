package ch.zuhlke.camp.kwiz.infrastructure;

import ch.zuhlke.camp.kwiz.domain.Game;
import ch.zuhlke.camp.kwiz.domain.GameEngine;
import ch.zuhlke.camp.kwiz.domain.Quiz;
import ch.zuhlke.camp.kwiz.domain.Round;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

class GameStateEndpointTest {

    @Mock
    private InMemoryGameRepository gameRepository;

    @Mock
    private GameEngine gameEngine;

    @Mock
    private Quiz quiz;

    @Mock
    private Game game;

    @Mock
    private Round round;

    private GameStateEndpoint gameStateEndpoint;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        gameStateEndpoint = new GameStateEndpoint(gameRepository, gameEngine);
    }

    @Test
    void gameState_shouldReturnQuizzesAndGames() {
        // Arrange
        List<Quiz> quizzes = new ArrayList<>();
        quizzes.add(quiz);
        List<Game> games = new ArrayList<>();
        games.add(game);
        List<Round> rounds = new ArrayList<>();
        rounds.add(round);

        when(gameEngine.getQuizzes()).thenReturn(quizzes);
        when(gameRepository.findAll()).thenReturn(games);
        when(quiz.getId()).thenReturn("quiz-id");
        when(quiz.getName()).thenReturn("Quiz Name");
        when(quiz.getMaxPlayers()).thenReturn(10);
        when(quiz.isStarted()).thenReturn(false);
        when(quiz.isEnded()).thenReturn(false);
        when(quiz.getPlayers()).thenReturn(new ArrayList<>());
        when(quiz.getRounds()).thenReturn(rounds);
        when(round.getId()).thenReturn("round-id");
        when(round.getName()).thenReturn("Round Name");
        when(round.isActive()).thenReturn(false);
        when(round.isCompleted()).thenReturn(false);
        when(round.getQuestions()).thenReturn(new ArrayList<>());
        when(game.getId()).thenReturn("game-id");
        when(game.getQuizDefinitionId()).thenReturn("quiz-id");
        when(game.getAdminId()).thenReturn("admin-id");
        when(game.getPlayers()).thenReturn(Map.of());
        when(game.getRounds()).thenReturn(rounds);

        // Act
        Map<String, Object> result = gameStateEndpoint.gameState();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertNotNull(result.get("quizzes"));
        assertNotNull(result.get("games"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> quizzesList = (List<Map<String, Object>>) result.get("quizzes");
        assertEquals(1, quizzesList.size());
        assertEquals("quiz-id", quizzesList.get(0).get("id"));
        assertEquals("Quiz Name", quizzesList.get(0).get("name"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> gamesList = (List<Map<String, Object>>) result.get("games");
        assertEquals(1, gamesList.size());
        assertEquals("game-id", gamesList.get(0).get("id"));
        assertEquals("quiz-id", gamesList.get(0).get("quizDefinitionId"));
    }
}