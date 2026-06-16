import { Routes } from '@angular/router';

export const workerRoutes: Routes = [
  {
    path: 'current-task',
    loadComponent: () =>
      import('./pages/current-task/current-task').then(
        (m) => m.WorkerCurrentTaskComponent,
      ),
  },
  {
    path: 'current',
    redirectTo: 'current-task',
    pathMatch: 'full',
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./pages/tasks/tasks').then((m) => m.TasksComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history/history').then((m) => m.HistoryPage),
  },
  {
    path: '',
    redirectTo: 'current-task',
    pathMatch: 'full',
  },
];
