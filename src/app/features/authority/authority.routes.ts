import { Routes } from '@angular/router';

export const authorityRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'live-map',
    },
    {
        path: 'live-map',
        loadComponent: () =>
            import('./live-map/live-map').then(
                (m) => m.LiveMap,
            ),
    },
    {
        path: 'reports',
        loadComponent: () =>
            import('./incoming-reports/incoming-reports').then(
                (m) => m.IncomingReportsComponent,
            ),
    },
    {
        path: 'report/:id',
        loadComponent: () =>
            import('./report-details/report-details.component').then(
                (m) => m.ReportDetailsComponent,
            ),
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./authority-dashboard/authority-dashboard.component').then(
                (m) => m.AuthorityDashboardComponent,
            ),
    },
];
