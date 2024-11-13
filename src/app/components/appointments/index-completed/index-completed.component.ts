import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import {
  GET_ALL_APPOINTMENTS,
  GET_APPOINTMENTS_BY_PATIENT,
  GET_APPOINTMENTS_BY_DOCTOR,
  GET_PATIENT_WITH_USER_BY_ID,
  GET_DOCTOR_WITH_USER_BY_ID,
} from '../../../graphql/queries.graphql';
import { FIND_CONSULTS_BY_APPOINTMENT } from '../../../graphql/queries.graphql';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { Subscription } from 'rxjs';
import { ModalModule, PaginationModule, ToastModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-index-completed',
  templateUrl: './index-completed.component.html',
  styleUrls: ['./index-completed.component.scss'],
  imports: [
    CommonModule,
    ToastModule,
    PaginationModule,
    ModalModule,
    FormsModule,
  ],
  standalone: true,
})
export class IndexCompletedComponent implements OnInit, OnDestroy {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  paginatedAppointments: any[] = [];
  searchText: string = '';

  totalAppointments: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';
  loading: boolean = false;

  private appointmentsQuery: QueryRef<any> | undefined;
  private querySubscription: Subscription | undefined;

  role: string | null = null;
  consultationsByAppointment: { [key: number]: boolean } = {};
  patientNames: { [key: number]: string } = {};
  doctorNames: { [key: number]: string } = {};

  constructor(
    private apollo: Apollo,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const doctorId = localStorage.getItem('doctorId');
    const patientId = localStorage.getItem('patientId');

    this.loadCompletedAppointments(token, doctorId, patientId);

    this.toastService.getToastState().subscribe((state) => {
      this.visible = state.visible;
      this.message = state.message;
      this.type = state.type;
    });
  }

  loadCompletedAppointments(
    token: string | null,
    doctorId: string | null,
    patientId: string | null
  ) {
    if (this.role === 'ADMINISTRATOR' || this.role === 'RECEPTIONIST') {
      this.appointmentsQuery = this.apollo.watchQuery<any>({
        query: GET_ALL_APPOINTMENTS,
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    } else if (this.role === 'DOCTOR' && doctorId) {
      this.appointmentsQuery = this.apollo.watchQuery<any>({
        query: GET_APPOINTMENTS_BY_DOCTOR,
        variables: { doctorId: Number(doctorId) },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    } else if (this.role === 'PATIENT' && patientId) {
      this.appointmentsQuery = this.apollo.watchQuery<any>({
        query: GET_APPOINTMENTS_BY_PATIENT,
        variables: { patientId: Number(patientId) },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    }

    if (this.appointmentsQuery) {
      this.querySubscription = this.appointmentsQuery.valueChanges.subscribe(
        ({ data, loading }) => {
          this.loading = loading;
          this.appointments =
            data?.getAllAppointments ||
            data?.getAppointmentsByDoctor ||
            data?.getAppointmentsByPatient ||
            [];

          // Filtrar citas completadas (no 'pending')
          this.filteredAppointments = this.appointments.filter(
            (appointment) => appointment.status !== 'pending'
          );

          // Ordenar por fecha y luego por ID
          this.filteredAppointments.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            return a.id - b.id; // Si las fechas son iguales, ordenar por ID
          });

          this.totalAppointments = this.filteredAppointments.length;

          // Cargar nombres de pacientes y doctores
          this.filteredAppointments.forEach((appointment) => {
            this.loadPatientName(appointment.patientId);
            this.loadDoctorName(appointment.doctorId);
          });

          this.updateCurrentPageAppointments();
        },
        (error) => {
          console.error('Error loading completed appointments:', error);
          this.toastService.showToast(
            'Error loading completed appointments',
            'error'
          );
        }
      );
    } else {
      console.warn(
        'Appointments query is undefined. Unable to load completed appointments.'
      );
    }
  }

  loadPatientName(patientId: number) {
    const token = localStorage.getItem('token');

    if (!this.patientNames[patientId]) {
      this.apollo
        .query<any>({
          query: GET_PATIENT_WITH_USER_BY_ID,
          variables: { patientId },
          context: { headers: { Authorization: `Bearer ${token}` } },
        })
        .subscribe({
          next: ({ data }) => {
            this.patientNames[patientId] =
              data?.getPatientWithUserById?.name || 'Desconocido';
          },
          error: () => {
            this.patientNames[patientId] = 'Desconocido';
          },
        });
    }
  }

  loadDoctorName(doctorId: number) {
    const token = localStorage.getItem('token');

    if (!this.doctorNames[doctorId]) {
      this.apollo
        .query<any>({
          query: GET_DOCTOR_WITH_USER_BY_ID,
          variables: { doctorId },
          context: { headers: { Authorization: `Bearer ${token}` } },
        })
        .subscribe({
          next: ({ data }) => {
            this.doctorNames[doctorId] =
              data?.getDoctorWithUserById?.name || 'Desconocido';
          },
          error: () => {
            this.doctorNames[doctorId] = 'Desconocido';
          },
        });
    }
  }

  filterAppointments() {
    if (!this.searchText) {
      this.filteredAppointments = [...this.appointments];
    } else {
      this.filteredAppointments = this.appointments.filter((appointment) =>
        Object.values(appointment).some((value) =>
          String(value).toLowerCase().includes(this.searchText.toLowerCase())
        )
      );
    }
    this.currentPage = 1;
    this.totalAppointments = this.filteredAppointments.length;
    this.updateCurrentPageAppointments();
  }

  updateCurrentPageAppointments() {
    if (this.filteredAppointments.length === 0) {
      this.paginatedAppointments = [];
    } else {
      this.paginatedAppointments = this.filteredAppointments.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    }
    this.cdr.detectChanges();
  }

  onPageChange(page: number) {
    if (page > 0 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updateCurrentPageAppointments();
    }
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages)
      .fill(0)
      .map((_, index) => index + 1);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalAppointments / this.itemsPerPage);
  }

  viewConsult(appointmentId: number): void {
    this.router.navigate(['/consults/view', appointmentId]);
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }
}
