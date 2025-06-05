import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        RouterTestingModule
      ]
    });

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  it('should have 4 footer links', () => {
    expect(component.footerLinks.length).toBe(4);
  });

  it('should have 3 social links', () => {
    expect(component.socialLinks.length).toBe(3);
  });

  it('should display all footer links in the template', () => {
    const footerLinkElements = fixture.debugElement.queryAll(By.css('.footer-links li'));
    expect(footerLinkElements.length).toBe(4);
  });

  it('should display all social links in the template', () => {
    const socialLinkElements = fixture.debugElement.queryAll(By.css('.social-icon'));
    expect(socialLinkElements.length).toBe(3);
  });

  it('should display the copyright notice with current year', () => {
    const currentYear = new Date().getFullYear();
    const copyrightElement = fixture.debugElement.query(By.css('.footer-bottom p'));
    expect(copyrightElement.nativeElement.textContent).toContain(`© ${currentYear} Zühlke`);
  });

  it('should have correct footer links', () => {
    expect(component.footerLinks[0]).toEqual({ label: 'Home', path: '/home' });
    expect(component.footerLinks[1]).toEqual({ label: 'About', path: '/home', fragment: 'about' });
    expect(component.footerLinks[2]).toEqual({ label: 'Create Quiz', path: '/home', fragment: 'create' });
    expect(component.footerLinks[3]).toEqual({ label: 'Join Quiz', path: '/home', fragment: 'join' });
  });

  it('should have correct social links', () => {
    expect(component.socialLinks[0]).toEqual({ label: 'GitHub', url: 'https://github.com/zuhlke', icon: 'github' });
    expect(component.socialLinks[1]).toEqual({ label: 'Twitter', url: 'https://twitter.com/zuhlke', icon: 'twitter' });
    expect(component.socialLinks[2]).toEqual({ label: 'LinkedIn', url: 'https://www.linkedin.com/company/zuhlke', icon: 'linkedin' });
  });
});