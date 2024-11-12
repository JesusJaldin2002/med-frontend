import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
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
  paginatedMedicalRecords: any[] = [];
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
    private toastService: ToastService,
    private cdr: ChangeDetectorRef // Para forzar la detección de cambios
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
        this.totalRecords = this.filteredMedicalRecords.length;
        this.updateCurrentPageRecords(); // Actualizar la página actual
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
        this.medicalRecords = this.medicalRecords.map(item =>
          item === record ? updatedRecord : item
        );
        this.filteredMedicalRecords = [...this.medicalRecords]; // Actualizar la lista filtrada
        this.updateCurrentPageRecords(); // Actualizar la lista paginada después de obtener el nombre del paciente
      },
      (error) => {
        console.error('Error al obtener el nombre del paciente', error);
        const updatedRecord = { ...record, patientName: 'Error al obtener' };
        this.medicalRecords = this.medicalRecords.map(item =>
          item === record ? updatedRecord : item
        );
        this.filteredMedicalRecords = [...this.medicalRecords]; // Actualizar la lista filtrada
        this.updateCurrentPageRecords(); // Actualizar la lista paginada después del error
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
    this.currentPage = 1; // Restablecer a la primera página después de filtrar
    this.totalRecords = this.filteredMedicalRecords.length; // Actualizar el total de registros después del filtrado
    this.updateCurrentPageRecords(); // Actualizar la lista paginada
  }

  updateCurrentPageRecords() {
    if (this.filteredMedicalRecords.length === 0) {
      this.paginatedMedicalRecords = [];
    } else {
      this.paginatedMedicalRecords = this.filteredMedicalRecords.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    }
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  onPageChange(page: number) {
    if (page > 0 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updateCurrentPageRecords();
    } else {
      console.warn('Invalid page change requested.');
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

  viewMedicalRecord(patientId: number): void {
    this.router.navigate(['/medical-records/show', patientId]);
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }
}
