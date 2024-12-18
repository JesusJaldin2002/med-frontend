import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { Router } from '@angular/router';


@Component({
    selector: 'app-page404',
    templateUrl: './page404.component.html',
    styleUrls: ['./page404.component.scss'],
    standalone: true,
    imports: [ContainerComponent, RowComponent, ColComponent, ButtonDirective]
})
export class Page404Component {

  constructor(private router: Router) {}

  navigateToHome() {
    this.router.navigate(['/']); // Navega a la ruta base o ajusta a la ruta de inicio de sesión
  }

}
