import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import {
  FIND_CONSULTS_BY_APPOINTMENT,
  GET_APPOINTMENT_BY_ID,
  GET_PATIENT_WITH_USER_BY_ID,
  GET_DOCTOR_WITH_USER_BY_ID,
} from '../../../graphql/queries.graphql';
import { DELETE_CONSULT, UPDATE_APPOINTMENT_STATUS } from '../../../graphql/mutations.graphql'; // Cambiado a UPDATE_APPOINTMENT_STATUS
import { CommonModule, Location } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { Subscription } from 'rxjs';
import { FormModule, ModalModule, ToastModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-show-consult',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule, ModalModule],
  standalone: true,
})
export class ShowComponent implements OnInit, OnDestroy {
  appointmentId: number | null = null;
  consultData: any = null;
  appointmentData: any = null;
  patientData: any = null;
  doctorData: any = null;
  loading: boolean = true;
  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';

  role: string | null = null;
  private querySubscription: Subscription | undefined;
  deleteModalVisible: boolean = false;

  constructor(
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    this.appointmentId = Number(
      this.route.snapshot.paramMap.get('appointmentId')
    );

    if (!this.appointmentId) {
      this.toastService.showToast(
        'Error: No se encontró el ID de la cita',
        'error'
      );
      this.router.navigate(['/appointments']);
      return;
    }

    this.fetchData();
    this.toastService.getToastState().subscribe((state) => {
      this.visible = state.visible;
      this.message = state.message;
      this.type = state.type;
    });
  }

  fetchData() {
    const token = localStorage.getItem('token');

    this.apollo
      .query<any>({
        query: FIND_CONSULTS_BY_APPOINTMENT,
        variables: { appointmentId: this.appointmentId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      })
      .subscribe({
        next: ({ data }) => {
          this.consultData = data?.findConsultsByAppointment || null;
          this.fetchAppointmentData();
        },
        error: () => {
          this.toastService.showToast('Error al cargar la consulta', 'error');
          this.loading = false;
        },
      });
  }

  fetchAppointmentData() {
    const token = localStorage.getItem('token');

    this.apollo
      .query<any>({
        query: GET_APPOINTMENT_BY_ID,
        variables: { appointmentId: this.appointmentId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      })
      .subscribe({
        next: ({ data }) => {
          this.appointmentData = data?.getAppointmentById || null;

          if (this.appointmentData) {
            this.fetchPatientData(this.appointmentData.patientId);
            this.fetchDoctorData(this.appointmentData.doctorId);
          } else {
            this.loading = false;
          }
        },
        error: () => {
          this.toastService.showToast(
            'Error al cargar la información de la cita',
            'error'
          );
          this.loading = false;
        },
      });
  }

  fetchPatientData(patientId: number) {
    const token = localStorage.getItem('token');

    this.apollo
      .query<any>({
        query: GET_PATIENT_WITH_USER_BY_ID,
        variables: { patientId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      })
      .subscribe({
        next: ({ data }) => {
          this.patientData = data?.getPatientWithUserById || null;
        },
        error: () => {
          this.toastService.showToast(
            'Error al cargar la información del paciente',
            'error'
          );
        },
      });
  }

  fetchDoctorData(doctorId: number) {
    const token = localStorage.getItem('token');

    this.apollo
      .query<any>({
        query: GET_DOCTOR_WITH_USER_BY_ID,
        variables: { doctorId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      })
      .subscribe({
        next: ({ data }) => {
          this.doctorData = data?.getDoctorWithUserById || null;
          this.loading = false;
        },
        error: () => {
          this.toastService.showToast(
            'Error al cargar la información del doctor',
            'error'
          );
          this.loading = false;
        },
      });
  }

  confirmDeleteConsult() {
    this.deleteModalVisible = true;
  }

  performDeleteConsult() {
    if (this.consultData && this.consultData.id !== null) {
      const token = localStorage.getItem('token');
      // Primero, eliminar la consulta
      this.apollo
        .mutate({
          mutation: DELETE_CONSULT,
          variables: { consultId: this.consultData.id }, // Usar el ID de la consulta
          context: { headers: { Authorization: `Bearer ${token}` } },
        })
        .subscribe({
          next: () => {
            // Después de eliminar la consulta, actualizar el estado de la cita a "pending"
            if (this.appointmentId !== null) {
              this.updateAppointmentStatusToPending();
            } else {
              this.toastService.showToast(
                'Consulta eliminada exitosamente',
                'success'
              );
              this.router.navigate(['/appointments/completed']).then(() => {
                window.location.reload(); // Forzar la recarga de la página
              });
            }
          },
          error: () => {
            this.toastService.showToast(
              'Error al eliminar la consulta',
              'error'
            );
          },
        });
    }
  }

  updateAppointmentStatusToPending() {
    if (this.appointmentId !== null) {
      const token = localStorage.getItem('token');
      this.apollo
        .mutate({
          mutation: UPDATE_APPOINTMENT_STATUS,
          variables: {
            appointmentId: this.appointmentId,
            status: 'pending',
          },
          context: { headers: { Authorization: `Bearer ${token}` } },
        })
        .subscribe({
          next: () => {
            this.toastService.showToast(
              'Consulta eliminada y cita actualizada a "pending" exitosamente',
              'success'
            );
            this.router.navigate(['/appointments/completed']).then(() => {
              window.location.reload(); // Forzar la recarga de la página
            });
          },
          error: () => {
            this.toastService.showToast(
              'Error al actualizar el estado de la cita',
              'error'
            );
          },
        });
    }
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }
}
