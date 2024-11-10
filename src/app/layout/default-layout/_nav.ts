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
      text: 'NEW'
    },
    roles: ['ADMINISTRATOR', 'RECEPTIONIST','DOCTOR']
  },
  {
    title: true,
    name: 'Sección de Doctores'
  },
  {
    name: 'Pacientes',
    url: '/patients',
    iconComponent: { name: 'cil-user' },
  },
  {
    name: 'Historias Clinicas',
    url: '/ejemplo-simple',
    iconComponent: { name: 'cil-description' }
  },
  {
    title: true,
    name: 'Sección de Pacientes'
  },
  {
    name: 'Ejemplo Simple',
    url: '/ejemplo-simple',
    iconComponent: { name: 'cil-star' }
  },
  {
    title: true,
    name: 'Sección de Citas'
  },
  {
    name: 'Ejemplo Simple',
    url: '/ejemplo-simple',
    iconComponent: { name: 'cil-star' }
  },
  
  {
    name: 'Dropdown Ejemplo',
    url: '/dropdown-ejemplo',
    iconComponent: { name: 'cil-list' },
    children: [
      {
        name: 'Sub-Opción 1',
        url: '/dropdown-ejemplo/opcion1',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Sub-Opción 2',
        url: '/dropdown-ejemplo/opcion2',
        icon: 'nav-icon-bullet'
      }
    ]
  },
];
