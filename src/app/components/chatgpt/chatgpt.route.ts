import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const chatgptRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'Crear Cita con IA',
      roles: ['ADMINISTRATOR', 'RECEPTIONIST','DOCTOR','PATIENT']
    },
    loadComponent: () =>
      import('./index/index.component').then((m) => m.IndexComponent),
    canActivate: [AuthGuard],
  },

];
