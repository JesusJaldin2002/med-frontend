// auth.service.ts
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { LOGOUT_MUTATION } from '../graphql/mutations.graphql'; // Asegúrate de definir la mutación en tu archivo GraphQL
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apollo: Apollo, private router: Router) {}

  logout() {
    const token = localStorage.getItem('token');

    if (!token) {
      // Si no hay token, redirige directamente al login
      this.router.navigate(['/login']);
      return;
    }

    this.apollo.mutate({
      mutation: LOGOUT_MUTATION,
      context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }).pipe(
      catchError((error) => {
        console.error('Error al cerrar sesión:', error);
        return of(null); // Manejo de errores simple
      })
    ).subscribe(() => {
      // Limpiar el token y redirigir al login
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    });
  }
}
