import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cats' },
      {
        path: 'cats',
        loadComponent: () =>
          import('./pages/cats-page.component').then((m) => m.CatsPageComponent),
      },
      {
        path: 'showcase',
        loadComponent: () =>
          import('./pages/showcase-page.component').then((m) => m.ShowcasePageComponent),
      },
      { path: 'feed', redirectTo: 'showcase' },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/messages-page.component').then(
            (m) => m.MessagesPageComponent
          ),
      },
      {
        path: 'forum',
        loadComponent: () =>
          import('./pages/forum-page.component').then((m) => m.ForumPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
