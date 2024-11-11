import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const scheduleRoutes: Routes = [
  {
    path: ':doctorId',
    data: {
      title: 'Horarios del Doctor',
    },
    loadComponent: () =>
      import('./index/index.component').then((m) => m.IndexComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'create/:doctorId',
    loadComponent: () =>
      import('./create/create.component').then((m) => m.CreateComponent),
    data: {
      title: 'Crear Horario',
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/:scheduleId',
    loadComponent: () =>
      import('./edit/edit.component').then((m) => m.EditComponent),
    data: {
      title: 'Editar Horario',
    },
    canActivate: [AuthGuard],
  }
];
