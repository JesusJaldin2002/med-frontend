import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { GET_ALL_MEDICAL_RECORDS, GET_PATIENT_WITH_USER_BY_ID } from '../../../graphql/queries.graphql';
import { DELETE_MEDICAL_RECORD } from '../../../graphql/mutations.graphql';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router'; 
import { ToastService } from '../../../services/toast.service';
import { Subscription } from 'rxjs';
import { ModalModule, PaginationModule, ToastModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-medical-records',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  imports: [CommonModule, ToastModule, PaginationModule, ModalModule, FormsModule, RouterModule],
  standalone: true,
})
export class IndexComponent implements OnInit, OnDestroy {
  medicalRecords: any[] = [];
  filteredMedicalRecords: any[] = [];
  searchText: string = '';

  totalRecords: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';
  loading: boolean = false;

  private recordsQuery: QueryRef<any> | undefined;
  private querySubscription: Subscription | undefined;

  selectedRecordId: number | null = null;
  deleteModalVisible: boolean = false;

  role: string | null = null;

  constructor(
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    this.loadMedicalRecords();
    if (history.state?.refresh) {
      this.recordsQuery?.refetch();
    }
    this.toastService.getToastState().subscribe((state) => {
      this.visible = state.visible;
      this.message = state.message;
      this.type = state.type;
    });
  }

  loadMedicalRecords() {
    const token = localStorage.getItem('token');

    this.recordsQuery = this.apollo.watchQuery<any>({
      query: GET_ALL_MEDICAL_RECORDS,
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    this.querySubscription = this.recordsQuery.valueChanges.subscribe(
      ({ data, loading }) => {
        this.loading = loading;
        this.medicalRecords = data.getAllMedicalRecords;

        // Fetch the patient name for each record
        this.medicalRecords.forEach(record => {
          this.fetchPatientName(record);
        });

        this.filteredMedicalRecords = [...this.medicalRecords];
        this.totalRecords = data.getAllMedicalRecords.length;
        this.updateCurrentPageRecords(this.filteredMedicalRecords);
      },
      (error) => {
        console.error('Error al cargar los registros médicos', error);
        this.toastService.showToast('Error al cargar los registros médicos', 'error');
      }
    );
  }

  fetchPatientName(record: any) {
    const token = localStorage.getItem('token');
  
    this.apollo.query<any>({
      query: GET_PATIENT_WITH_USER_BY_ID,
      variables: { patientId: record.patientId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }).subscribe(
      ({ data }) => {
        const updatedRecord = {
          ...record,
          patientName: data?.getPatientWithUserById?.name || 'No encontrado'
        };
        // Crear un nuevo arreglo actualizando solo el registro modificado
        this.medicalRecords = this.medicalRecords.map(item =>
          item === record ? updatedRecord : item
        );
        this.filteredMedicalRecords = [...this.medicalRecords]; // Actualizar la lista filtrada
      },
      (error) => {
        console.error('Error al obtener el nombre del paciente', error);
        const updatedRecord = { ...record, patientName: 'Error al obtener' };
        this.medicalRecords = this.medicalRecords.map(item =>
          item === record ? updatedRecord : item
        );
        this.filteredMedicalRecords = [...this.medicalRecords]; // Actualizar la lista filtrada
      }
    );
  }
  

  filterMedicalRecords() {
    if (!this.searchText) {
      this.filteredMedicalRecords = [...this.medicalRecords];
    } else {
      this.filteredMedicalRecords = this.medicalRecords.filter(record =>
        Object.values(record).some(value =>
          String(value).toLowerCase().includes(this.searchText.toLowerCase())
        )
      );
    }
    this.updateCurrentPageRecords(this.filteredMedicalRecords);
  }

  updateCurrentPageRecords(allRecords: any[] = []) {
    this.filteredMedicalRecords = allRecords.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  onPageChange(page: number) {
    if (page > 0 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updateCurrentPageRecords(this.filteredMedicalRecords);
    }
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((_, index) => index + 1);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.itemsPerPage);
  }

  editMedicalRecord(patientId: number): void {
    this.router.navigate(['/medical-records/edit', patientId]);
  }

  confirmDeleteMedicalRecord(id: number): void {
    this.selectedRecordId = id;
    this.deleteModalVisible = true;
  }

  performDeleteMedicalRecord(): void {
    if (this.selectedRecordId !== null) {
      const token = localStorage.getItem('token');

      this.apollo.mutate({
        mutation: DELETE_MEDICAL_RECORD,
        variables: { medicalRecordId: this.selectedRecordId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }).subscribe({
        next: () => {
          this.toastService.showToast('Registro médico eliminado exitosamente', 'success');
          this.recordsQuery?.refetch();
        },
        error: (err) => {
          console.error('Error al eliminar el registro médico', err);
          this.toastService.showToast('Error al eliminar el registro médico', 'error');
        },
      });

      this.deleteModalVisible = false;
      this.selectedRecordId = null;
    }
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }
}
