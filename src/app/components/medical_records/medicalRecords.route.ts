import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const medicalRecordRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'Historias Clinicas',
      roles: ['ADMINISTRATOR', 'RECEPTIONIST']
    },
    loadComponent: () =>
      import('./index/index.component').then((m) => m.IndexComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'create/:patientId',
    loadComponent: () =>
      import('./create/create.component').then((m) => m.CreateComponent),
    data: {
      title: 'Crear Historia Clinica',
      roles: ['ADMINISTRATOR', 'RECEPTIONIST','DOCTOR']
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/:patientId',
    loadComponent: () =>
      import('./edit/edit.component').then((m) => m.EditComponent),
    data: {
      title: 'Editar Historia Clinica',
      roles: ['ADMINISTRATOR', 'RECEPTIONIST']
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'show/:patientId',
    loadComponent: () =>
      import('./show/show.component').then((m) => m.ShowComponent),
    data: {
      title: 'Historia Clinica',
      roles: ['ADMINISTRATOR', 'RECEPTIONIST','DOCTOR','PATIENT']
    },
    canActivate: [AuthGuard],
  },
];

