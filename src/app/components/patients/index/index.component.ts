import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { GET_ALL_PATIENTS, GET_MEDICAL_RECORD_BY_PATIENT } from '../../../graphql/queries.graphql';
import { DELETE_PATIENT } from '../../../graphql/mutations.graphql';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { Subscription } from 'rxjs';
import { ModalModule, PaginationModule, ToastModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patients',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  imports: [CommonModule, ToastModule, PaginationModule, ModalModule, FormsModule],
  standalone: true,
})
export class IndexComponent implements OnInit, OnDestroy {
  patients: any[] = [];
  filteredPatients: any[] = [];
  paginatedPatients: any[] = [];
  medicalRecordsExistence: { [patientId: number]: boolean } = {};
  searchText: string = '';

  totalPatients: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';
  loading: boolean = false;

  private patientsQuery: QueryRef<any> | undefined;
  private querySubscription: Subscription | undefined;

  selectedPatientId: number | null = null;
  deleteModalVisible: boolean = false;

  role: string | null = null;

  constructor(
    private apollo: Apollo,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef // Forzar la detección de cambios
  ) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    this.loadPatients();
    if (history.state?.refresh) {
      this.patientsQuery?.refetch();
    }
    this.toastService.getToastState().subscribe((state) => {
      this.visible = state.visible;
      this.message = state.message;
      this.type = state.type;
    });
  }

  loadPatients() {
    const token = localStorage.getItem('token');

    this.patientsQuery = this.apollo.watchQuery<any>({
      query: GET_ALL_PATIENTS,
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    this.querySubscription = this.patientsQuery.valueChanges.subscribe(
      ({ data, loading }) => {
        this.loading = loading;
        this.patients = data?.getAllPatients || [];
        this.filteredPatients = [...this.patients];
        this.totalPatients = this.filteredPatients.length; // Actualizar el total de pacientes basado en los resultados filtrados
        this.updateCurrentPagePatients();

        // Verificar si los pacientes tienen una historia clínica
        this.patients.forEach(patient => {
          this.checkMedicalRecord(patient.idPatient);
        });
      },
      (error) => {
        console.error('Error fetching patients:', error);
      }
    );
  }

  checkMedicalRecord(patientId: number) {
    const token = localStorage.getItem('token');

    this.apollo.query<any>({
      query: GET_MEDICAL_RECORD_BY_PATIENT,
      variables: { patientId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }).subscribe(
      ({ data }) => {
        this.medicalRecordsExistence[patientId] = !!data?.getMedicalRecordByPatient;
        console.log(`Medical record existence for patient ${patientId}:`, this.medicalRecordsExistence[patientId]);
      },
      () => {
        this.medicalRecordsExistence[patientId] = false;
        console.log(`Medical record existence for patient ${patientId}:`, this.medicalRecordsExistence[patientId]);
      }
    );
  }

  filterPatients() {
    if (!this.searchText) {
      this.filteredPatients = [...this.patients];
    } else {
      this.filteredPatients = this.patients.filter(patient =>
        Object.values(patient).some(value =>
          String(value).toLowerCase().includes(this.searchText.toLowerCase())
        )
      );
    }
    this.currentPage = 1; // Restablecer a la primera página
    this.totalPatients = this.filteredPatients.length; // Actualizar el total de pacientes después del filtrado
    this.updateCurrentPagePatients();
  }

  updateCurrentPagePatients() {
    if (this.filteredPatients.length === 0) {
      this.paginatedPatients = [];
    } else {
      this.paginatedPatients = this.filteredPatients.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    }
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  onPageChange(page: number) {
    if (page > 0 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updateCurrentPagePatients();
    } else {
      console.warn('Invalid page change requested.');
    }
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages)
      .fill(0)
      .map((_, index) => index + 1);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalPatients / this.itemsPerPage);
  }

  createPatient() {
    this.router.navigate(['/patients/create']);
  }

  editPatient(id: number): void {
    this.router.navigate(['/patients/edit', id]);
  }

  confirmDeletePatient(id: number): void {
    this.selectedPatientId = id;
    this.deleteModalVisible = true;
  }

  performDeletePatient(): void {
    if (this.selectedPatientId !== null) {
      const token = localStorage.getItem('token');

      this.apollo
        .mutate({
          mutation: DELETE_PATIENT,
          variables: { patientId: this.selectedPatientId },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        })
        .subscribe({
          next: () => {
            this.toastService.showToast(
              'Paciente eliminado exitosamente',
              'success'
            );
            this.patientsQuery?.refetch();
          },
          error: (err) => {
            console.error('Error al eliminar el paciente', err);
            this.toastService.showToast('Error al eliminar el paciente', 'error');
          },
        });

      this.deleteModalVisible = false;
      this.selectedPatientId = null;
    }
  }

  createMedicalRecord(patientId: number): void {
    this.router.navigate(['/medical-records/create', patientId]);
  }

  viewMedicalRecord(patientId: number): void {
    this.router.navigate(['/medical-records/show', patientId]);
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }
}
