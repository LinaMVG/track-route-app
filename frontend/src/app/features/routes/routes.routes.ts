import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/route-list.component').then((m) => m.RouteListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'new',
    loadComponent: () => import('../../features/routes/forms/route-form.component.component').then((m) => m.RouteFormComponent),
    canActivate: [authGuard, roleGuard('ADMIN')],
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('../../features/routes/forms/route-form.component.component').then((m) => m.RouteFormComponent),
    canActivate: [authGuard, roleGuard('ADMIN')],
  },
];
