import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const medicalNoteRoutes: Routes = [
  {
    path: 'create/:medicalRecordId',
    loadComponent: () =>
      import('./create/create.component').then((m) => m.CreateComponent),
    data: {
      title: 'Crear nota médica',
      roles: ['ADMINISTRATOR','DOCTOR']
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/:medicalNoteId',
    loadComponent: () =>
      import('./edit/edit.component').then((m) => m.EditComponent),
    data: {
      title: 'Editar nota médica',
      roles: ['ADMINISTRATOR', 'DOCTOR']
    },
    canActivate: [AuthGuard],
  },
];

