import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  // Current year for copyright
  currentYear = new Date().getFullYear();
  
  // Footer links
  footerLinks = [
    { label: 'Home', path: '/home' },
    { label: 'About', path: '/home', fragment: 'about' },
    { label: 'Create Quiz', path: '/home', fragment: 'create' },
    { label: 'Join Quiz', path: '/home', fragment: 'join' }
  ];
  
  // Social media links
  socialLinks = [
    { label: 'GitHub', url: 'https://github.com/zuhlke', icon: 'github' },
    { label: 'Twitter', url: 'https://twitter.com/zuhlke', icon: 'twitter' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/company/zuhlke', icon: 'linkedin' }
  ];
}