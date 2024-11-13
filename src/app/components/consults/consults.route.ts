import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const consultRoutes: Routes = [
  {
    path: 'create/:appointmentId',
    loadComponent: () =>
      import('./create/create.component').then((m) => m.CreateComponent),
    data: {
      title: 'Crear Consulta',
      roles: ['ADMINISTRATOR', 'DOCTOR']
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/:appointmentId',
    loadComponent: () =>
      import('./edit/edit.component').then((m) => m.EditComponent),
    data: {
      title: 'Editar Consulta',
      roles: ['ADMINISTRATOR', 'DOCTOR']
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:appointmentId',
    loadComponent: () =>
      import('./show/show.component').then((m) => m.ShowComponent),
    data: {
      title: 'Mostrar Consulta',
      roles: ['ADMINISTRATOR', 'DOCTOR','PATIENT']
    },
    canActivate: [AuthGuard],
  },
  
];

