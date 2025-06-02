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
    path: 'join-quizz/:quizId',
    loadComponent: () => import('./join-quizz/join-quizz.component').then(m => m.JoinQuizzComponent)
  },
  {
    path: 'player/:quizId/:gameId',
    loadComponent: () => import('./player/game-play-area/game-play-area.component').then(m => m.GamePlayAreaComponent)
  },
  { 
    path: 'waiting-room/:quizId', 
    loadComponent: () => import('./waiting-room/waiting-room.component').then(m => m.WaitingRoomComponent)
  }
];
