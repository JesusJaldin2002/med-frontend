import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { AuthGuard } from './guards/auth.guard';
import { patientRoutes } from './components/patients/patients.route';
import { doctorRoutes } from './components/doctors/doctors.route';
import { scheduleRoutes } from './components/schedules/schedules.route';
import { medicalRecordRoutes } from './components/medical_records/medicalRecords.route';
import { medicalNoteRoutes } from './components/medical_notes/medicalNotes.route';
import { appointmentRoutes } from './components/appointments/appointments.route';
import { consultRoutes } from './components/consults/consults.route';
import { chatgptRoutes } from './components/chatgpt/chatgpt.route';
import { Page404Component } from './views/pages/page404/page404.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: {
      title: 'Login Page',
    },
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home',
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/routes').then((m) => m.routes),
        canActivate: [AuthGuard],
      },
      {
        path: 'patients',
        children: patientRoutes,
        canActivate: [AuthGuard],
      },
      {
        path: 'doctors',
        children: doctorRoutes,
        canActivate: [AuthGuard],
      },
      {
        path: 'schedules',
        children: scheduleRoutes,
        canActivate: [AuthGuard],
      },
      {
        path: 'medical-records',
        children: medicalRecordRoutes,
        canActivate: [AuthGuard],
      },
      {
        path: 'medical-notes',
        children: medicalNoteRoutes,
        canActivate: [AuthGuard],
      },
      {
        path: 'appointments',
        children: appointmentRoutes,
        canActivate: [AuthGuard],
      },
      {
        path: 'consults',
        children: consultRoutes,
        canActivate: [AuthGuard],
      },
      {
        path: 'create-appointments-with-AI',
        children: chatgptRoutes,
        canActivate: [AuthGuard],
      },
    ],
  },
  { path: '**', component: Page404Component },
];
