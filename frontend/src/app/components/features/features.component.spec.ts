import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturesComponent } from './features.component';
import { By } from '@angular/platform-browser';

describe('FeaturesComponent', () => {
  let component: FeaturesComponent;
  let fixture: ComponentFixture<FeaturesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FeaturesComponent]
    });

    fixture = TestBed.createComponent(FeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 6 features', () => {
    expect(component.features.length).toBe(6);
  });

  it('should display all features in the template', () => {
    const featureCards = fixture.debugElement.queryAll(By.css('.feature-card'));
    expect(featureCards.length).toBe(6);
  });

  it('should display correct feature titles', () => {
    const featureTitles = fixture.debugElement.queryAll(By.css('.feature-title'));
    
    expect(featureTitles[0].nativeElement.textContent).toContain('Create Custom Quizzes');
    expect(featureTitles[1].nativeElement.textContent).toContain('Real-time Gameplay');
    expect(featureTitles[2].nativeElement.textContent).toContain('Multiple Rounds');
    expect(featureTitles[3].nativeElement.textContent).toContain('Leaderboards');
    expect(featureTitles[4].nativeElement.textContent).toContain('Easy to Join');
    expect(featureTitles[5].nativeElement.textContent).toContain('Quizmaster Controls');
  });

  it('should display correct feature icons', () => {
    const featureIcons = fixture.debugElement.queryAll(By.css('.material-icons'));
    
    expect(featureIcons[0].nativeElement.textContent).toContain('edit');
    expect(featureIcons[1].nativeElement.textContent).toContain('timer');
    expect(featureIcons[2].nativeElement.textContent).toContain('layers');
    expect(featureIcons[3].nativeElement.textContent).toContain('leaderboard');
    expect(featureIcons[4].nativeElement.textContent).toContain('group_add');
    expect(featureIcons[5].nativeElement.textContent).toContain('admin_panel_settings');
  });

  it('should display correct feature descriptions', () => {
    const featureDescriptions = fixture.debugElement.queryAll(By.css('.feature-description'));
    
    expect(featureDescriptions[0].nativeElement.textContent).toContain('Design your own quiz');
    expect(featureDescriptions[1].nativeElement.textContent).toContain('Enjoy interactive gameplay');
    expect(featureDescriptions[2].nativeElement.textContent).toContain('Organize your quiz into different themed rounds');
    expect(featureDescriptions[3].nativeElement.textContent).toContain('Track scores and see who\'s in the lead');
    expect(featureDescriptions[4].nativeElement.textContent).toContain('Participants can quickly join your quiz');
    expect(featureDescriptions[5].nativeElement.textContent).toContain('As a quizmaster, you have full control');
  });
});