import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule
      ]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have navigation links', () => {
    expect(component.navLinks.length).toBeGreaterThan(0);
  });

  it('should have a Home link', () => {
    const homeLink = component.navLinks.find(link => link.label === 'Home');
    expect(homeLink).toBeTruthy();
    expect(homeLink?.path).toBe('/home');
  });

  it('should display the logo with correct text', () => {
    const logoElement = fixture.debugElement.query(By.css('.logo h1'));
    expect(logoElement.nativeElement.textContent).toBe('KwiZ');
    
    const taglineElement = fixture.debugElement.query(By.css('.tagline'));
    expect(taglineElement.nativeElement.textContent).toBe('The Zühlke Pub Quiz');
  });

  it('should display navigation links in the template', () => {
    const navLinkElements = fixture.debugElement.queryAll(By.css('.navigation li'));
    expect(navLinkElements.length).toBe(component.navLinks.length);
    
    // Check the first link (Home)
    const homeLinkElement = navLinkElements[0].query(By.css('a'));
    expect(homeLinkElement.nativeElement.textContent.trim()).toBe('Home');
  });
});