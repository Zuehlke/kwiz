import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RotatingBallComponent } from './rotating-ball.component';
import { ElementRef } from '@angular/core';

// We'll use a simplified approach for testing this component
// since it heavily relies on Three.js and GSAP

describe('RotatingBallComponent', () => {
  let component: RotatingBallComponent;
  let fixture: ComponentFixture<RotatingBallComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RotatingBallComponent]
    });

    fixture = TestBed.createComponent(RotatingBallComponent);
    component = fixture.componentInstance;

    // Mock the renderer container
    const mockElementRef = new ElementRef(document.createElement('div'));
    (mockElementRef.nativeElement as HTMLElement).getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    // Set the mock element ref
    (component as any).rendererContainer = mockElementRef;

    // Spy on lifecycle methods
    spyOn(component as any, 'initThreeJs').and.callThrough();
    spyOn(component as any, 'setupRenderer').and.callThrough();
    spyOn(component as any, 'setupPostprocessing').and.callThrough();
    spyOn(component as any, 'setupEventListeners').and.callThrough();
    spyOn(component as any, 'animate').and.callThrough();

    // Mock cancelAnimationFrame to prevent animation loop
    spyOn(window, 'cancelAnimationFrame');
    spyOn(window, 'requestAnimationFrame').and.returnValue(1);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize Three.js in ngOnInit', () => {
    expect((component as any).initThreeJs).toHaveBeenCalled();
  });

  it('should set up renderer, postprocessing, and event listeners in ngAfterViewInit', () => {
    expect((component as any).setupRenderer).toHaveBeenCalled();
    expect((component as any).setupPostprocessing).toHaveBeenCalled();
    expect((component as any).setupEventListeners).toHaveBeenCalled();
    expect((component as any).animate).toHaveBeenCalled();
  });

  it('should clean up resources in ngOnDestroy', () => {
    // Set animationFrameId to simulate active animation
    (component as any).animationFrameId = 123;

    // Call ngOnDestroy
    component.ngOnDestroy();

    // Verify cancelAnimationFrame was called
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(123);
  });

  it('should handle window resize', () => {
    // Mock renderer and camera
    (component as any).renderer = {
      setSize: jasmine.createSpy('setSize'),
      setPixelRatio: jasmine.createSpy('setPixelRatio')
    };

    (component as any).camera = {
      aspect: 1,
      updateProjectionMatrix: jasmine.createSpy('updateProjectionMatrix')
    };

    (component as any).composer = {
      setSize: jasmine.createSpy('setSize')
    };

    // Call onWindowResize
    component.onWindowResize();

    // Verify methods were called
    expect((component as any).renderer.setSize).toHaveBeenCalled();
    expect((component as any).renderer.setPixelRatio).toHaveBeenCalled();
    expect((component as any).camera.updateProjectionMatrix).toHaveBeenCalled();
    expect((component as any).composer.setSize).toHaveBeenCalled();
  });
});
