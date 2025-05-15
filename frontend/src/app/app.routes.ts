import { Routes } from '@angular/router';

export const routes: Routes = [
  // Define routes here
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },

  // These are placeholder routes - the actual components will need to be created
  { 
    path: 'quiz-master/:quizId', 
    // This is a temporary redirect until the quiz-master component is created
    resolve: {
      redirect: () => {
        alert('Quiz Master page not implemented yet. Redirecting to home page.');
        return true;
      }
    },
    redirectTo: '/home'
  },
  { 
    path: 'participant/:quizId', 
    // This is a temporary redirect until the participant component is created
    resolve: {
      redirect: () => {
        alert('Participant page not implemented yet. Redirecting to home page.');
        return true;
      }
    },
    redirectTo: '/home'
  },
  { 
    path: 'waiting-room/:quizId', 
    loadComponent: () => import('./waiting-room/waiting-room.component').then(m => m.WaitingRoomComponent)
  }
];
