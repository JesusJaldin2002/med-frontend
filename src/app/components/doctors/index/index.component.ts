import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { GET_ALL_DOCTORS } from '../../../graphql/queries.graphql';
import { DELETE_DOCTOR } from '../../../graphql/mutations.graphql';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { Subscription } from 'rxjs';
import { ModalModule, PaginationModule, ToastModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctors',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  imports: [
    CommonModule,
    ToastModule,
    PaginationModule,
    ModalModule,
    FormsModule,
  ],
  standalone: true,
})
export class IndexComponent implements OnInit, OnDestroy {
  doctors: any[] = [];
  filteredDoctors: any[] = []; // Lista filtrada de doctores
  paginatedDoctors: any[] = []; // Lista paginada de doctores
  searchText: string = ''; // Texto de búsqueda

  totalDoctors: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';
  loading: boolean = false;

  private doctorsQuery: QueryRef<any> | undefined;
  private querySubscription: Subscription | undefined;

  selectedDoctorId: number | null = null; // Para almacenar el ID del doctor a eliminar
  deleteModalVisible: boolean = false; // Para controlar la visibilidad del modal

  role: string | null = null;

  constructor(
    private apollo: Apollo,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef // Para forzar la detección de cambios
  ) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    this.loadDoctors();
    if (history.state?.refresh) {
      this.doctorsQuery?.refetch();
    }
    this.toastService.getToastState().subscribe((state) => {
      this.visible = state.visible;
      this.message = state.message;
      this.type = state.type;
    });
  }

  loadDoctors() {
    const token = localStorage.getItem('token');

    this.doctorsQuery = this.apollo.watchQuery<any>({
      query: GET_ALL_DOCTORS,
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    this.querySubscription = this.doctorsQuery.valueChanges.subscribe(
      ({ data, loading }) => {
        this.loading = loading;
        this.doctors = data.getAllDoctors;
        this.filteredDoctors = [...this.doctors];
        this.totalDoctors = this.filteredDoctors.length; // Total de doctores basado en resultados filtrados
        this.updateCurrentPageDoctors(); // Actualizar la página actual
      }
    );
  }

  filterDoctors() {
    if (!this.searchText) {
      this.filteredDoctors = [...this.doctors];
    } else {
      this.filteredDoctors = this.doctors.filter((doctor) =>
        Object.values(doctor).some((value) =>
          String(value).toLowerCase().includes(this.searchText.toLowerCase())
        )
      );
    }
    this.currentPage = 1; // Restablecer a la primera página después de filtrar
    this.totalDoctors = this.filteredDoctors.length; // Actualizar el total de doctores después del filtrado
    this.updateCurrentPageDoctors(); // Actualizar la página actual
  }

  updateCurrentPageDoctors() {
    if (this.filteredDoctors.length === 0) {
      this.paginatedDoctors = [];
    } else {
      this.paginatedDoctors = this.filteredDoctors.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    }
    
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  onPageChange(page: number) {
    
    if (page > 0 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updateCurrentPageDoctors();
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
    return Math.ceil(this.totalDoctors / this.itemsPerPage);
  }

  createDoctor() {
    this.router.navigate(['/doctors/create']);
  }

  editDoctor(id: number): void {
    this.router.navigate(['/doctors/edit', id]);
  }

  confirmDeleteDoctor(id: number): void {
    this.selectedDoctorId = id;
    this.deleteModalVisible = true;
  }

  performDeleteDoctor(): void {
    if (this.selectedDoctorId !== null) {
      const token = localStorage.getItem('token');

      this.apollo
        .mutate({
          mutation: DELETE_DOCTOR,
          variables: { doctorId: this.selectedDoctorId },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        })
        .subscribe({
          next: () => {
            this.toastService.showToast(
              'Doctor eliminado exitosamente',
              'success'
            );
            this.doctorsQuery?.refetch();
          },
          error: (err) => {
            console.error('Error al eliminar el doctor', err);
            this.toastService.showToast('Error al eliminar el doctor', 'error');
          },
        });

      this.deleteModalVisible = false;
      this.selectedDoctorId = null;
    }
  }

  viewSchedules(doctorId: number): void {
    this.router.navigate(['/schedules', doctorId]);
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }
}
