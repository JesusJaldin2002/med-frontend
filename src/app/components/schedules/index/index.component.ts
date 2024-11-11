import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { GET_SCHEDULES_BY_DOCTOR } from '../../../graphql/queries.graphql';
import { DELETE_SCHEDULE } from '../../../graphql/mutations.graphql';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router'; 
import { ToastService } from '../../../services/toast.service';
import { Subscription } from 'rxjs';
import { ModalModule, PaginationModule, ToastModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedules',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  imports: [CommonModule, ToastModule, PaginationModule, ModalModule, FormsModule, RouterModule],
  standalone: true,
})
export class IndexComponent implements OnInit, OnDestroy {
  schedules: any[] = [];
  filteredSchedules: any[] = [];
  searchText: string = '';

  totalSchedules: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';
  loading: boolean = false;

  private schedulesQuery: QueryRef<any> | undefined;
  private querySubscription: Subscription | undefined;

  selectedScheduleId: number | null = null;
  deleteModalVisible: boolean = false;

  role: string | null = null;

  private daysOfWeekOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    this.loadSchedules();
    if (history.state?.refresh) {
      this.schedulesQuery?.refetch();
    }
    this.toastService.getToastState().subscribe((state) => {
      this.visible = state.visible;
      this.message = state.message;
      this.type = state.type;
    });
  }

  loadSchedules() {
    const token = localStorage.getItem('token');
    const doctorId = Number(this.route.snapshot.paramMap.get('doctorId'));

    if (!doctorId) {
      console.error('No se encontró el doctorId en la ruta');
      this.toastService.showToast('Error: No se pudo cargar el doctorId', 'error');
      return;
    }

    this.schedulesQuery = this.apollo.watchQuery<any>({
      query: GET_SCHEDULES_BY_DOCTOR,
      variables: { doctorId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    this.querySubscription = this.schedulesQuery.valueChanges.subscribe(
      ({ data, loading }) => {
        this.loading = loading;
        this.schedules = data.getSchedulesByDoctor;
        this.filteredSchedules = [...this.schedules];
        this.sortSchedules(); // Ordena los horarios
        this.totalSchedules = data.getSchedulesByDoctor.length;
        this.updateCurrentPageSchedules(this.filteredSchedules);
      },
      (error) => {
        console.error('Error al cargar los horarios', error);
        this.toastService.showToast('Error al cargar los horarios', 'error');
      }
    );
  }

  sortSchedules() {
    this.filteredSchedules.sort((a, b) => {
      const dayIndexA = this.daysOfWeekOrder.indexOf(a.dayOfWeek);
      const dayIndexB = this.daysOfWeekOrder.indexOf(b.dayOfWeek);
      if (dayIndexA !== dayIndexB) {
        return dayIndexA - dayIndexB;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }

  filterSchedules() {
    if (!this.searchText) {
      this.filteredSchedules = [...this.schedules];
    } else {
      this.filteredSchedules = this.schedules.filter(schedule =>
        Object.values(schedule).some(value =>
          String(value).toLowerCase().includes(this.searchText.toLowerCase())
        )
      );
    }
    this.sortSchedules();
    this.updateCurrentPageSchedules(this.filteredSchedules);
  }

  updateCurrentPageSchedules(allSchedules: any[] = []) {
    this.filteredSchedules = allSchedules.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  onPageChange(page: number) {
    if (page > 0 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updateCurrentPageSchedules(this.filteredSchedules);
    }
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((_, index) => index + 1);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalSchedules / this.itemsPerPage);
  }

  createSchedule(): void {
    const doctorId = this.route.snapshot.paramMap.get('doctorId');
    if (doctorId) {
      this.router.navigate(['/schedules/create', doctorId]);
    } else {
      this.toastService.showToast('Error: No se encontró el doctorId', 'error');
    }
  }

  editSchedule(id: number): void {
    this.router.navigate(['/schedules/edit', id]);
  }

  confirmDeleteSchedule(id: number): void {
    this.selectedScheduleId = id;
    this.deleteModalVisible = true;
  }

  performDeleteSchedule(): void {
    if (this.selectedScheduleId !== null) {
      const token = localStorage.getItem('token');

      this.apollo.mutate({
        mutation: DELETE_SCHEDULE,
        variables: { scheduleId: this.selectedScheduleId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }).subscribe({
        next: () => {
          this.toastService.showToast('Horario eliminado exitosamente', 'success');
          this.schedulesQuery?.refetch();
        },
        error: (err) => {
          console.error('Error al eliminar el horario', err);
          this.toastService.showToast('Error al eliminar el horario', 'error');
        },
      });

      this.deleteModalVisible = false;
      this.selectedScheduleId = null;
    }
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }
}
