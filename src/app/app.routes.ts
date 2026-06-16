// app.routes.ts

import { Routes } from '@angular/router';

import {
  authGuard,
  publicGuard
} from './core/guards/auth.guard';
import { Role } from './shared/enums/role.enum';

export const routes: Routes = [

  // ==================== Auth ====================

  {
    path: 'auth',

    canActivate: [publicGuard],

    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.authRoutes),
  },

  // ==================== Worker ====================

  {
    path: 'worker',

    canActivate: [authGuard],

    data: {
      role: Role.Worker
    },

    loadComponent: () =>
      import('./layouts/worker-layout/worker-layout.component')
        .then(m => m.WorkerLayoutComponent),

    children: [
      {
        path: '',

        loadChildren: () =>
          import('./features/worker/worker.routes')
            .then(m => m.workerRoutes),
      }
    ]
  },

  // ==================== Authority ====================

  {
    path: 'authority',

    canActivate: [authGuard],

    data: {
      role: Role.Authority
    },

    loadComponent: () =>
      import('./layouts/authority-layout/authority-layout.component')
        .then(m => m.AuthorityLayoutComponent),

    children: [
      {
        path: '',

        loadChildren: () =>
          import('./features/authority/authority.routes')
            .then(m => m.authorityRoutes),
      }
    ]
  },

  // ==================== Admin ====================

  {
    path: 'admin',

    canActivate: [authGuard],

    data: {
      role: Role.Admin
    },

    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component')
        .then(m => m.AdminLayoutComponent),

    children: [
      {
        path: '',

        loadChildren: () =>
          import('./features/admin/admin.routes')
            .then(m => m.adminRoutes),
      }
    ]
  },

  // ==================== Public ====================

  {
    path: '',

    loadComponent: () =>
      import('./layouts/public-layout/public-layout.component')
        .then(m => m.PublicLayoutComponent),

    children: [
      {
        path: '',

        loadChildren: () =>
          import('./features/public/public.routes')
            .then(m => m.publicRoutes),
      }
    ]
  },

  // ==================== Not Found ====================

  {
    path: 'not-found',
    loadComponent: () =>
      import('./shared/components/not-found/not-found'),
  },

  // ==================== Fallback ====================

  {
    path: '**',
    redirectTo: 'not-found',
  },
];