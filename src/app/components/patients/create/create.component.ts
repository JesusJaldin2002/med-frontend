import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { REGISTER_PATIENT } from '../../../graphql/mutations.graphql';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service'; // Ajusta la ruta según sea necesario

@Component({
  selector: 'app-create',
  standalone: true,
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule]
})
export class CreateComponent {
  user = {
    username: '',
    email: '',
    password: '',
    repeatedPassword: '',
    name: ''
  };

  patient = {
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: ''
  };

  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';

  constructor(private apollo: Apollo, private router: Router, private toastService: ToastService) {}

  onSubmit() {
    const token = localStorage.getItem('token');

    this.apollo.mutate({
      mutation: REGISTER_PATIENT,
      variables: {
        userInput: this.user,
        patientInput: this.patient
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }).subscribe({
      next: () => {
        this.toastService.showToast('Paciente registrado exitosamente', 'success');
        // Redirigir y forzar la recarga de la lista al volver
        this.router.navigateByUrl('/patients', { state: { refresh: true } });
      },
      error: (err) => {
        console.error('Error al registrar el paciente', err);
        this.visible = true;
        this.message = `Error al registrar el paciente: ${err.message}`;
        this.type = 'error';
        setTimeout(() => {
          this.visible = false;
        }, 3000);
      }
    });
  }
}
