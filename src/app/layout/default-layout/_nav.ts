import { INavData } from '@coreui/angular';

export interface CustomNavData extends INavData {
  roles?: string[];
}

export const navItems: CustomNavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW',
    },
    roles: ['ADMINISTRATOR', 'RECEPTIONIST', 'DOCTOR'],
  },
  {
    title: true,
    name: 'Sección de Doctores',
    roles: ['ADMINISTRATOR', 'RECEPTIONIST'],
  },
  {
    name: 'Doctores',
    url: '/doctors',
    iconComponent: { name: 'cil-medical-cross' },
    roles: ['ADMINISTRATOR', 'RECEPTIONIST'],
  },
  {
    title: true,
    name: 'Sección de Pacientes',
    roles: ['ADMINISTRATOR', 'RECEPTIONIST', 'DOCTOR'],
  },
  {
    name: 'Pacientes',
    url: '/patients',
    iconComponent: { name: 'cil-user' },
    roles: ['ADMINISTRATOR', 'RECEPTIONIST', 'DOCTOR'],
  },
  {
    name: 'Historias Clinicas',
    url: '/medical-records',
    iconComponent: { name: 'cil-description' },
    roles: ['ADMINISTRATOR', 'RECEPTIONIST']
  },
  {
    title: true,
    name: 'Sección de Atención',
  },
  {
    name: 'Citas Pendietes',
    url: '/appointments',
    iconComponent: { name: 'cil-calendar' },
    roles: ['ADMINISTRATOR', 'RECEPTIONIST','DOCTOR','PATIENT']
  },
  {
    name: 'Citas Completadas',
    url: '/appointments/completed',
    iconComponent: { name: 'cil-calendar-check' },
    roles: ['ADMINISTRATOR', 'RECEPTIONIST','DOCTOR','PATIENT']
  },
  {
    name: 'Chatgpt',
    url: '/chatgpt',
    iconComponent: { name: 'cibProbot' },
    roles: ['ADMINISTRATOR', 'RECEPTIONIST','DOCTOR','PATIENT']
  },


  // {
  //   name: 'Dropdown Ejemplo',
  //   url: '/dropdown-ejemplo',
  //   iconComponent: { name: 'cil-list' },
  //   children: [
  //     {
  //       name: 'Sub-Opción 1',
  //       url: '/dropdown-ejemplo/opcion1',
  //       icon: 'nav-icon-bullet',
  //     },
  //     {
  //       name: 'Sub-Opción 2',
  //       url: '/dropdown-ejemplo/opcion2',
  //       icon: 'nav-icon-bullet',
  //     },
  //   ],
  // },
];
