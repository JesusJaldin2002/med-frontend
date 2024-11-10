import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

export const patientRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'Pacientes',
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
      title: 'Crear Paciente',
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit/edit.component').then((m) => m.EditComponent),
    data: {
      title: 'Editar Paciente',
    },
    canActivate: [AuthGuard],
  },
];
