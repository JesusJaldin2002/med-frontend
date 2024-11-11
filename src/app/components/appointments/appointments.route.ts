import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const appointmentRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'Citas',
      roles: ['ADMINISTRATOR', 'RECEPTIONIST']
    },
    loadComponent: () =>
      import('./index/index.component').then((m) => m.IndexComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./create/create.component').then((m) => m.CreateComponent),
    data: {
      title: 'Crear Cita',
      roles: ['ADMINISTRATOR', 'RECEPTIONIST']
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/:appointmentId',
    loadComponent: () =>
      import('./edit/edit.component').then((m) => m.EditComponent),
    data: {
      title: 'Editar Cita',
      roles: ['ADMINISTRATOR', 'RECEPTIONIST']
    },
    canActivate: [AuthGuard],
  },
  
];

