import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  // Array of features to display
  features = [
    {
      title: 'Create Custom Quizzes',
      description: 'Design your own quiz with multiple rounds and questions. Set time limits and customize your quiz experience.',
      icon: 'edit'
    },
    {
      title: 'Real-time Gameplay',
      description: 'Enjoy interactive gameplay with instant feedback. See scores update in real-time as participants answer questions.',
      icon: 'timer'
    },
    {
      title: 'Multiple Rounds',
      description: 'Organize your quiz into different themed rounds with varying difficulty levels to keep participants engaged.',
      icon: 'layers'
    },
    {
      title: 'Leaderboards',
      description: 'Track scores and see who\'s in the lead. Competitive leaderboards show rankings after each round.',
      icon: 'leaderboard'
    },
    {
      title: 'Easy to Join',
      description: 'Participants can quickly join your quiz using a unique ID or link. No account required!',
      icon: 'group_add'
    },
    {
      title: 'Quizmaster Controls',
      description: 'As a quizmaster, you have full control over the quiz flow, including starting, pausing, and ending the quiz.',
      icon: 'admin_panel_settings'
    }
  ];
}