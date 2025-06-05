import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinQuizInfoComponent } from './join-quiz-info.component';
import { By } from '@angular/platform-browser';
import { QRCodeComponent } from 'angularx-qrcode';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('JoinQuizInfoComponent', () => {
  let component: JoinQuizInfoComponent;
  let fixture: ComponentFixture<JoinQuizInfoComponent>;
  let documentMock: Document;

  beforeEach(() => {
    // Create a mock for the document with the methods we need
    documentMock = document;

    // Mock the document.location.origin property
    Object.defineProperty(documentMock, 'location', {
      value: {
        origin: 'http://localhost:4200'
      },
      writable: true
    });

    TestBed.configureTestingModule({
      imports: [
        JoinQuizInfoComponent
      ],
      schemas: [NO_ERRORS_SCHEMA] // This allows us to ignore unknown elements like qrcode
    });

    fixture = TestBed.createComponent(JoinQuizInfoComponent);
    component = fixture.componentInstance;

    // Set test quiz ID
    component.quizId = 'test-quiz-123';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate join URL on init', () => {
    expect(component.joinUrl).toBe('http://localhost:4200/join-quizz/test-quiz-123');
  });

  it('should display the quiz ID', () => {
    const codeTextElement = fixture.debugElement.query(By.css('.code-text'));
    expect(codeTextElement.nativeElement.textContent).toBe('test-quiz-123');
  });

  it('should include a copy button', () => {
    const copyButton = fixture.debugElement.query(By.css('.copy-button'));
    expect(copyButton).toBeTruthy();
  });

  it('should include a QR code', () => {
    const qrCodeElement = fixture.debugElement.query(By.css('qrcode'));
    expect(qrCodeElement).toBeTruthy();
  });

  it('should set QR code data to the join URL', () => {
    const qrCodeElement = fixture.debugElement.query(By.css('qrcode'));
    expect(qrCodeElement.properties['qrdata']).toBe('http://localhost:4200/join-quizz/test-quiz-123');
  });

  it('should adjust QR code size based on compact mode', () => {
    // Default (not compact)
    let qrCodeElement = fixture.debugElement.query(By.css('qrcode'));
    expect(qrCodeElement.properties['width']).toBe(220);

    // Set to compact mode
    component.compact = true;
    fixture.detectChanges();

    qrCodeElement = fixture.debugElement.query(By.css('qrcode'));
    expect(qrCodeElement.properties['width']).toBe(160);
  });

  it('should call copyQuizId when copy button is clicked', () => {
    spyOn(component, 'copyQuizId');

    const copyButton = fixture.debugElement.query(By.css('.copy-button'));
    copyButton.triggerEventHandler('click', null);

    expect(component.copyQuizId).toHaveBeenCalled();
  });

  it('should copy quiz ID to clipboard when copyQuizId is called', () => {
    // Mock clipboard API
    const clipboardWriteTextSpy = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

    component.copyQuizId();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-quiz-123');
  });

  it('should set copySuccess to true when copying is successful', async () => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

    component.copyQuizId();
    await fixture.whenStable();

    expect(component.copySuccess).toBe(true);

    // Wait for the timeout to reset copySuccess
    jasmine.clock().install();
    jasmine.clock().tick(2100);
    expect(component.copySuccess).toBe(false);
    jasmine.clock().uninstall();
  });
});
