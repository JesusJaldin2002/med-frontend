import { Component } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardGroupComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { GET_MY_PROFILE } from 'src/app/graphql/queries.graphql';
import { AUTHENTICATE_USER } from '../../../graphql/mutations.graphql';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,
    CommonModule,
    FormsModule,
  ],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private apollo: Apollo, private router: Router) {
    const token = localStorage.getItem('token');
    if (token) {
      // Si hay un token, redirige al usuario al dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required';
      return;
    }
  
    this.loading = true;
    this.errorMessage = '';
  
    this.apollo
      .mutate({
        mutation: AUTHENTICATE_USER,
        variables: {
          input: {
            identifier: this.username,
            password: this.password,
          },
        },
      })
      .subscribe({
        next: ({ data }: any) => {
          const token = data?.authenticate?.jwt;
          const role = data?.authenticate?.role;
          const doctorId = data?.authenticate?.doctorId;
          const patientId = data?.authenticate?.patientId;
  
          if (token) {
            // Almacena el token y el rol
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
  
            // Almacena el ID correspondiente si el usuario es un Doctor o Paciente
            if (role === 'DOCTOR' && doctorId) {
              localStorage.setItem('doctorId', doctorId.toString());
              console.log("Doctor ID guardado ", doctorId)
            } else if (role === 'PATIENT' && patientId) {
              localStorage.setItem('patientId', patientId.toString());
              console.log("Paciente ID guardado ", patientId)
            }
  
            console.log('Role guardado:', role);
            console.log('Token guardado:', token);
            
            // Limpiar campos y redirigir
            this.username = '';
            this.password = '';
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Authentication failed. No token received.';
          }
        },
        error: (err) => {
          const graphQLErrors = err?.graphQLErrors;
          if (graphQLErrors && graphQLErrors.length > 0) {
            this.errorMessage = graphQLErrors[0].message || 'An error occurred';
          } else {
            this.errorMessage = 'An unexpected error occurred';
          }
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private fetchUserProfile(token: string) {
    this.apollo
      .query({
        query: GET_MY_PROFILE,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      })
      .subscribe({
        next: ({ data }: any) => {
          const name = data?.findMyProfile?.name;
          if (name) {
            localStorage.setItem('name', name);
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error fetching user profile:', err);
        },
      });
  }
}
