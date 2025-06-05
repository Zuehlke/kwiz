import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroComponent } from './hero.component';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { RotatingBallComponent } from '../rotating-ball/rotating-ball.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;
  let documentMock: Document;

  beforeEach(() => {
    // Create a mock for the document with the methods we need
    documentMock = document;
    
    // Spy on document methods
    spyOn(documentMock, 'getElementById').and.returnValue({
      scrollIntoView: jasmine.createSpy('scrollIntoView')
    } as any);
    
    spyOn(documentMock, 'querySelector').and.returnValue({
      click: jasmine.createSpy('click')
    } as any);

    TestBed.configureTestingModule({
      imports: [
        HeroComponent,
        RouterTestingModule
      ],
      schemas: [NO_ERRORS_SCHEMA] // This allows us to ignore unknown elements like app-rotating-ball
    });

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title, subtitle, and description', () => {
    expect(component.title).toBe('Welcome to KwiZ');
    expect(component.subtitle).toBe('The Ultimate Pub Quiz Experience');
    expect(component.description).toContain('Create or join interactive quiz games');
  });

  it('should display the title, subtitle, and description in the template', () => {
    const titleElement = fixture.debugElement.query(By.css('.hero-title'));
    const subtitleElement = fixture.debugElement.query(By.css('.hero-subtitle'));
    const descriptionElement = fixture.debugElement.query(By.css('.hero-description'));
    
    expect(titleElement.nativeElement.textContent).toBe(component.title);
    expect(subtitleElement.nativeElement.textContent).toBe(component.subtitle);
    expect(descriptionElement.nativeElement.textContent).toBe(component.description);
  });

  it('should have two call-to-action buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.hero-actions .btn'));
    
    expect(buttons.length).toBe(2);
    expect(buttons[0].nativeElement.textContent).toBe('Create Quiz');
    expect(buttons[1].nativeElement.textContent).toBe('Join Quiz');
  });

  it('should include the rotating ball component', () => {
    const rotatingBallElement = fixture.debugElement.query(By.css('app-rotating-ball'));
    expect(rotatingBallElement).toBeTruthy();
  });

  it('should call scrollToGameActions when Create Quiz button is clicked', () => {
    spyOn(component, 'scrollToGameActions');
    
    const createButton = fixture.debugElement.queryAll(By.css('.hero-actions .btn'))[0];
    createButton.triggerEventHandler('click', null);
    
    expect(component.scrollToGameActions).toHaveBeenCalledWith('create');
  });

  it('should call scrollToGameActions when Join Quiz button is clicked', () => {
    spyOn(component, 'scrollToGameActions');
    
    const joinButton = fixture.debugElement.queryAll(By.css('.hero-actions .btn'))[1];
    joinButton.triggerEventHandler('click', null);
    
    expect(component.scrollToGameActions).toHaveBeenCalledWith('join');
  });

  it('should scroll to game actions and click the appropriate tab', () => {
    // Call the method directly
    component.scrollToGameActions('create');
    
    // Verify that getElementById was called with the correct ID
    expect(documentMock.getElementById).toHaveBeenCalledWith('game-actions');
    
    // We need to use jasmine.any because setTimeout is asynchronous
    setTimeout(() => {
      expect(documentMock.querySelector).toHaveBeenCalledWith('.tab-button:nth-child(1)');
    }, 600);
  });
});