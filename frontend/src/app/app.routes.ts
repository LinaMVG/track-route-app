import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {path: 'routes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/routes/routes.routes').then(m => m.routes)
  },
  {path: 'monitoring',
    canActivate: [authGuard],
    loadComponent: () => import('./features/monitoring/monitoring.component').then(m => m.MonitoringComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
