// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users/users').then(m => m.Users)
  },
    {
    path: 'create-user',
    loadComponent: () =>
      import('./pages/create-user/create-user').then(m => m.CreateUserPageComponent)
  },
  // الراوتر الجديد
  {
    path: 'audit-logs',
    loadComponent: () =>
      import('./pages/audit-logs/audit-logs').then(m => m.AuditLogsPageComponent)
  }

];