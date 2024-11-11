import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { REGISTER_DOCTOR } from '../../../graphql/mutations.graphql';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service'; // Ajusta la ruta según sea necesario

@Component({
  selector: 'app-create-doctor',
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

  doctor = {
    specialty: '',
    licenseNumber: '',
    phone: ''
  };

  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';

  constructor(private apollo: Apollo, private router: Router, private toastService: ToastService) {}

  onSubmit() {
    const token = localStorage.getItem('token');

    this.apollo.mutate({
      mutation: REGISTER_DOCTOR,
      variables: {
        userInput: this.user,
        doctorInput: this.doctor
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }).subscribe({
      next: () => {
        this.toastService.showToast('Doctor registrado exitosamente', 'success');
        // Redirigir y forzar la recarga de la lista al volver
        this.router.navigateByUrl('/doctors', { state: { refresh: true } });
      },
      error: (err) => {
        console.error('Error al registrar el doctor', err);
        this.visible = true;
        this.message = `Error al registrar el doctor: ${err.message}`;
        this.type = 'error';
        setTimeout(() => {
          this.visible = false;
        }, 3000);
      }
    });
  }
}
