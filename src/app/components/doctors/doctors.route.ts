import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const doctorRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'Doctores',
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
      title: 'Crear Doctor',
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit/edit.component').then((m) => m.EditComponent),
    data: {
      title: 'Editar Doctor',
    },
    canActivate: [AuthGuard],
  },
];
