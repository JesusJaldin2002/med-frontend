import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { VALIDATE_TOKEN } from '../graphql/queries.graphql';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private apollo: Apollo) {}

  private showToast(message: string) {
    const toast = document.createElement('div');
    toast.className =
      'toast align-items-center text-white bg-danger border-0 show';
    toast.style.position = 'fixed';
    toast.style.top = '1rem';
    toast.style.right = '1rem';
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      this.showToast('No se encontró token. Redirigiendo al login.');
      this.router.navigate(['/login']);
      return of(false);
    }

    const allowedRoles = route.data['roles'] as string[]; // Obtiene los roles permitidos para la ruta
    if (allowedRoles && !allowedRoles.includes(role || '')) {
      // Si el rol del usuario no está permitido
      this.showToast('Acceso denegado. No tienes permiso para acceder a esta ruta.');
      this.router.navigate(['/not-authorized']); // Redirige a una página de "No autorizado"
      return of(false);
    }

    // Valida el token si el rol es permitido
    return this.apollo
      .query({
        query: VALIDATE_TOKEN,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result: any) => {
          if (result?.data?.validateToken) {
            return true;
          } else {
            this.showToast('Sesión expirada. Por favor, inicie sesión nuevamente.');
            this.router.navigate(['/login']);
            return false;
          }
        }),
        catchError((error) => {
          console.error('Error en la validación del token:', error);
          this.showToast('Error de autenticación. Redirigiendo al login.');
          this.router.navigate(['/login']);
          return of(false);
        })
      );
  }
}
