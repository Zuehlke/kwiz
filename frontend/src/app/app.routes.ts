import { Routes } from '@angular/router';

export const routes: Routes = [
  // Define routes here
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) }
];