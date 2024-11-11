import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
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

  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    console.log('Su rol actual es :', role);
    if (!token) {
      // Token is not found, redirect and show a toast
      this.showToast('No se encontró token. Redirigiendo al login.');
      this.router.navigate(['/login']);
      return of(false);
    }

    // console.log('Token encontrado:', token);
    // Perform GraphQL query to validate the token
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
          console.log('Respuesta de validateToken:', result);
          if (result?.data?.validateToken) {
            // Token is valid
            console.log('Token válido');
            
            return true;
          } else {
            // Token is invalid
            console.log('Token inválido, redirigiendo al login');
            this.showToast(
              'Sesión expirada. Por favor, inicie sesión nuevamente.'
            );
            this.router.navigate(['/login']);
            return false;
          }
        }),
        catchError((error) => {
          // Handle errors gracefully
          console.error('Error en la validación del token:', error);
          this.showToast('Error de autenticación. Redirigiendo al login.');
          this.router.navigate(['/login']);
          return of(false);
        })
      );
  }
}
