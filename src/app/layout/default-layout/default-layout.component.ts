import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective,
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { CustomNavData } from './_nav';
import { navItems } from './_nav';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    IconDirective,
    NgScrollbar,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    ContainerComponent,
    RouterOutlet,
    DefaultFooterComponent,
  ],
})
export class DefaultLayoutComponent {
  public navItems: CustomNavData[] = []; // Especifica el tipo aquí

  constructor() {
    const role = localStorage.getItem('role') || 'GUEST'; // Obtén el rol del usuario

    // Filtrar `navItems` según el rol del usuario
    this.navItems = navItems.filter((item) =>
      this.filterNavItem(item, role)
    );
  }

  private filterNavItem(item: CustomNavData, role: string): boolean {
    // Si el elemento tiene hijos, aplica el filtro a los hijos también
    if (item.children) {
      item.children = item.children.filter((child: CustomNavData) => {
        // Si no hay `roles` definidos, muestra el elemento para todos
        if (!child.roles) {
          return true;
        }
        // Si hay `roles` definidos, muestra el elemento solo si el usuario tiene uno de los roles permitidos
        return child.roles.includes(role);
      });
      // Solo muestra el elemento si tiene hijos visibles después del filtrado
      return item.children.length > 0;
    }
  
    // Si no hay `roles` definidos, muestra el elemento para todos
    if (!item.roles) {
      return true;
    }
  
    // Si hay `roles` definidos, muestra el elemento solo si el usuario tiene uno de los roles permitidos
    return item.roles.includes(role);
  }

  onScrollbarUpdate($event: any) {
    // if ($event.verticalUsed) {
    // console.log('verticalUsed', $event.verticalUsed);
    // }
  }
}
