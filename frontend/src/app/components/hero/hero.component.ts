import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  // Properties for the hero component
  title = 'Welcome to KwiZ';
  subtitle = 'The Ultimate Pub Quiz Experience';
  description = 'Create or join interactive quiz games with friends and colleagues. Test your knowledge, compete for the top spot, and have fun!';
}