import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const appointmentRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'Citas',
      roles: ['ADMINISTRATOR', 'RECEPTIONIST', 'DOCTOR', 'PATIENT'],
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
      roles: ['ADMINISTRATOR', 'RECEPTIONIST'],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'completed',
    loadComponent: () =>
      import('./index-completed/index-completed.component').then((m) => m.IndexCompletedComponent),
    data: {
      title: 'Citas Completadas',
      roles: ['ADMINISTRATOR', 'RECEPTIONIST','DOCTOR', 'PATIENT'],
    },
    canActivate: [AuthGuard],
  },
];
