// src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login'),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register'),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password'),
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('./pages/verify-otp/verify-otp'),
  },
  {
    path: 'verify-reset-otp',
    loadComponent: () => import('./pages/verify-reset-otp/verify-reset-otp'),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
];