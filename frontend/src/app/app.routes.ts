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
    loadComponent: () => import('./player-name/player-name.component').then(m => m.PlayerNameComponent)
  },
  { 
    path: 'waiting-room/:quizId', 
    loadComponent: () => import('./waiting-room/waiting-room.component').then(m => m.WaitingRoomComponent)
  }
];
