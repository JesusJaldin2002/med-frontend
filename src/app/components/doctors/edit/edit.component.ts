import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { UPDATE_DOCTOR } from '../../../graphql/mutations.graphql';
import { GET_DOCTOR_WITH_USER_BY_ID } from '../../../graphql/queries.graphql'; // Importa la consulta correspondiente
import { ToastService } from '../../../services/toast.service';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-doctor',
  standalone: true,
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule]
})
export class EditComponent implements OnInit {
  doctor: any = {
    specialty: '',
    licenseNumber: '',
    phone: ''
  };
  user: any = {
    username: '',
    email: '',
    name: ''
  };
  doctorId: number | null = null;

  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apollo: Apollo,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.doctorId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.doctorId) {
      this.loadDoctorData(this.doctorId);
    }
  }

  loadDoctorData(doctorId: number) {
    const token = localStorage.getItem('token');

    this.apollo.query<any>({
      query: GET_DOCTOR_WITH_USER_BY_ID,
      variables: { doctorId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result) => {
        if (result.data && result.data.getDoctorWithUserById) {
          const doctorData = result.data.getDoctorWithUserById;
          // Mapear los datos al modelo de tu componente
          this.doctor = {
            specialty: doctorData.specialty,
            licenseNumber: doctorData.licenseNumber,
            phone: doctorData.phone
          };
          this.user = {
            username: doctorData.username,
            email: doctorData.email,
            name: doctorData.name
          };
        } else {
          this.toastService.showToast('No se encontraron datos para este doctor', 'error');
          this.router.navigate(['/doctors']);
        }
      },
      error: (error) => {
        console.error('Error al cargar los datos del doctor', error);
        this.toastService.showToast('Error al cargar los datos del doctor', 'error');
        this.router.navigate(['/doctors']);
      }
    });
  }

  onSubmit() {
    const token = localStorage.getItem('token');
  
    // Construye el userInput condicionalmente
    const userInput: any = {
      username: this.user.username,
      email: this.user.email,
      name: this.user.name,
    };
  
    // Solo agrega las contraseñas si tienen valores
    if (this.user.password && this.user.repeatedPassword) {
      userInput.password = this.user.password;
      userInput.repeatedPassword = this.user.repeatedPassword;
    }
  
    if (this.doctorId !== null) {
      this.apollo.mutate({
        mutation: UPDATE_DOCTOR,
        variables: {
          doctorId: this.doctorId,
          doctorInput: {
            specialty: this.doctor.specialty,
            licenseNumber: this.doctor.licenseNumber,
            phone: this.doctor.phone
          },
          userInput: userInput
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }).subscribe({
        next: () => {
          this.toastService.showToast('Doctor actualizado exitosamente', 'success');
          this.router.navigateByUrl('/doctors', { state: { refresh: true } });
        },
        error: (err) => {
          console.error('Error al actualizar el doctor', err);
          this.visible = true;
          this.message = `Error al actualizar el doctor: ${err.message}`;
          this.type = 'error';
          setTimeout(() => {
            this.visible = false;
          }, 3000);
        }
      });
    }
  }
}
