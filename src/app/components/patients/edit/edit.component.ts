import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { UPDATE_PATIENT } from '../../../graphql/mutations.graphql';
import { GET_PATIENT_WITH_USER_BY_ID } from '../../../graphql/queries.graphql'; // Importa tu nueva consulta
import { ToastService } from '../../../services/toast.service';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit',
  standalone: true,
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule]
})
export class EditComponent implements OnInit {
  patient: any = {
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: ''
  };
  user: any = {
    username: '',
    email: '',
    name: ''
  };
  patientId: number | null = null;

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
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.patientId) {
      this.loadPatientData(this.patientId);
    }
  }

  loadPatientData(patientId: number) {
    const token = localStorage.getItem('token');

    this.apollo.query<any>({
      query: GET_PATIENT_WITH_USER_BY_ID,
      variables: { patientId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result) => {
        if (result.data && result.data.getPatientWithUserById) {
          const patientData = result.data.getPatientWithUserById;
          // Mapear los datos al modelo de tu componente
          this.patient = {
            dateOfBirth: patientData.dateOfBirth,
            gender: patientData.gender,
            phone: patientData.phone,
            address: patientData.address
          };
          this.user = {
            username: patientData.username,
            email: patientData.email,
            name: patientData.name
          };
        } else {
          this.toastService.showToast('No se encontraron datos para este paciente', 'error');
          this.router.navigate(['/patients']);
        }
      },
      error: (error) => {
        console.error('Error al cargar los datos del paciente', error);
        this.toastService.showToast('Error al cargar los datos del paciente', 'error');
        this.router.navigate(['/patients']);
      }
    });
  }

  onSubmit() {

    const token = localStorage.getItem('token');

    if (this.patientId !== null) {
      this.apollo.mutate({
        mutation: UPDATE_PATIENT,
        variables: {
          patientId: this.patientId,
          patientInput: {
            dateOfBirth: this.patient.dateOfBirth,
            gender: this.patient.gender,
            phone: this.patient.phone,
            address: this.patient.address
          },
          userInput: {
            username: this.user.username,
            email: this.user.email,
            name: this.user.name
          }
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }).subscribe({
        next: () => {
          this.toastService.showToast('Paciente actualizado exitosamente', 'success');
          this.router.navigateByUrl('/patients', { state: { refresh: true } });
        },
        error: (error) => {
          console.error('Error al actualizar el paciente', error);
          this.toastService.showToast('Error al actualizar el paciente', 'error');
        }
      });
    }
  }
}
