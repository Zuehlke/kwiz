import { Routes } from '@angular/router';

export const routes: Routes = [
  // Define routes here
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },

  // These are placeholder routes - the actual components will need to be created
  { 
    path: 'quiz-master/:quizId', 
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
  },
  { 
    path: 'player/:quizId', 
    // This is a temporary redirect until the player component is created
    resolve: {
      redirect: () => {
        alert('Player page not implemented yet. Redirecting to home page.');
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
