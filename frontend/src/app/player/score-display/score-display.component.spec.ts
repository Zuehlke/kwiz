import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoreDisplayComponent } from './score-display.component';
import { By } from '@angular/platform-browser';
import { PlayerScore } from '../../types/game.types';

describe('ScoreDisplayComponent', () => {
  let component: ScoreDisplayComponent;
  let fixture: ComponentFixture<ScoreDisplayComponent>;

  // Mock leaderboard data
  const mockLeaderboard: PlayerScore[] = [
    { playerId: 'player1', playerName: 'Alice', score: 100 },
    { playerId: 'player2', playerName: 'Bob', score: 85 },
    { playerId: 'player3', playerName: 'Charlie', score: 70 },
    { playerId: 'player4', playerName: 'David', score: 55 },
    { playerId: 'player5', playerName: 'Eve', score: 40 },
    { playerId: 'player6', playerName: 'Frank', score: 25 } // This one shouldn't show in top 5
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ScoreDisplayComponent
      ]
    });

    fixture = TestBed.createComponent(ScoreDisplayComponent);
    component = fixture.componentInstance;
    
    // Set default values
    component.playerScore = 70; // Same as Charlie's score
    component.leaderboard = mockLeaderboard;
    component.showPlayerScore = true;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display player score when showPlayerScore is true', () => {
    const playerScoreContainer = fixture.debugElement.query(By.css('.player-score-container'));
    expect(playerScoreContainer).toBeTruthy();
    
    const scoreValue = fixture.debugElement.query(By.css('.score-value'));
    expect(scoreValue.nativeElement.textContent).toBe('70');
  });

  it('should not display player score when showPlayerScore is false', () => {
    component.showPlayerScore = false;
    fixture.detectChanges();
    
    const playerScoreContainer = fixture.debugElement.query(By.css('.player-score-container'));
    expect(playerScoreContainer).toBeFalsy();
  });

  it('should display player rank correctly', () => {
    const rankInfo = fixture.debugElement.query(By.css('.rank-info'));
    expect(rankInfo.nativeElement.textContent).toContain('#3'); // Charlie is ranked 3rd
  });

  it('should display top 5 players in the leaderboard', () => {
    const leaderboardItems = fixture.debugElement.queryAll(By.css('.leaderboard-item'));
    expect(leaderboardItems.length).toBe(5); // Only top 5 should be shown
    
    // Check first and last visible players
    expect(leaderboardItems[0].query(By.css('.player-name')).nativeElement.textContent).toBe('Alice');
    expect(leaderboardItems[4].query(By.css('.player-name')).nativeElement.textContent).toBe('Eve');
    
    // Frank should not be visible as he's 6th
    const frankElement = fixture.debugElement.queryAll(By.css('.player-name')).find(
      el => el.nativeElement.textContent === 'Frank'
    );
    expect(frankElement).toBeFalsy();
  });

  it('should sort players by score in descending order', () => {
    // Add a new player with the highest score
    component.leaderboard = [
      ...mockLeaderboard,
      { playerId: 'player7', playerName: 'Grace', score: 120 }
    ];
    fixture.detectChanges();
    
    const leaderboardItems = fixture.debugElement.queryAll(By.css('.leaderboard-item'));
    
    // Grace should be first now
    expect(leaderboardItems[0].query(By.css('.player-name')).nativeElement.textContent).toBe('Grace');
    expect(leaderboardItems[0].query(By.css('.rank')).nativeElement.textContent).toBe('#1');
  });

  it('should display correct ranks in the leaderboard', () => {
    const rankElements = fixture.debugElement.queryAll(By.css('.rank'));
    
    expect(rankElements[0].nativeElement.textContent).toBe('#1');
    expect(rankElements[1].nativeElement.textContent).toBe('#2');
    expect(rankElements[2].nativeElement.textContent).toBe('#3');
    expect(rankElements[3].nativeElement.textContent).toBe('#4');
    expect(rankElements[4].nativeElement.textContent).toBe('#5');
  });

  it('should display a message when leaderboard is empty', () => {
    component.leaderboard = [];
    fixture.detectChanges();
    
    const noDataMessage = fixture.debugElement.query(By.css('.no-data-message'));
    expect(noDataMessage).toBeTruthy();
    expect(noDataMessage.nativeElement.textContent.trim()).toBe('No scores available yet');
    
    const leaderboardItems = fixture.debugElement.queryAll(By.css('.leaderboard-item'));
    expect(leaderboardItems.length).toBe(0);
  });

  it('should calculate player rank correctly', () => {
    // Test with different player scores
    
    // Same as the highest score (Alice)
    component.playerScore = 100;
    expect(component.playerRank).toBe(1);
    
    // Same as the middle score (Charlie)
    component.playerScore = 70;
    expect(component.playerRank).toBe(3);
    
    // Lower than the lowest score
    component.playerScore = 10;
    expect(component.playerRank).toBe(7); // Should be after all 6 players
    
    // Between existing scores
    component.playerScore = 80;
    expect(component.playerRank).toBe(3); // Should be between Bob and Charlie
  });

  it('should handle tied scores correctly in player rank calculation', () => {
    // Add a player with the same score as Charlie
    component.leaderboard = [
      ...mockLeaderboard,
      { playerId: 'player7', playerName: 'Grace', score: 70 }
    ];
    
    // Set player score to match Charlie and Grace
    component.playerScore = 70;
    
    // Since scores are tied, the first occurrence in the sorted array gets the higher rank
    // The exact rank depends on the implementation, but it should be consistent
    const rank = component.playerRank;
    expect(rank).toBeGreaterThanOrEqual(3); // Should be at least 3rd
    expect(rank).toBeLessThanOrEqual(5); // Should be at most 5th (if both Charlie and Grace are ahead)
  });
});