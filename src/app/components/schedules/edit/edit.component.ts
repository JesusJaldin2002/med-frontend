import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { UPDATE_SCHEDULE } from '../../../graphql/mutations.graphql';
import { GET_SCHEDULE_BY_ID } from '../../../graphql/queries.graphql';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-edit-schedule',
  standalone: true,
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule]
})
export class EditComponent implements OnInit {
  schedule = {
    dayOfWeek: '',
    startTime: '',
    endTime: ''
  };
  daysOfWeek: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  scheduleId: number | null = null;
  doctorId: number | null = null; // Esto lo podemos usar para volver al listado de horarios del doctor

  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';

  constructor(
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.scheduleId = Number(this.route.snapshot.paramMap.get('scheduleId'));
    this.doctorId = Number(this.route.snapshot.paramMap.get('doctorId'));

    this.toastService.showToast('Mensaje de prueba al iniciar', 'success');

    if (this.scheduleId) {
      this.loadScheduleData(this.scheduleId);
    } else {
      this.toastService.showToast('Error: No se encontró el scheduleId', 'error');
      this.router.navigate(['/schedules']);
    }
  }

  loadScheduleData(scheduleId: number) {
    const token = localStorage.getItem('token');

    this.apollo.query<any>({
      query: GET_SCHEDULE_BY_ID,
      variables: { scheduleId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result) => {
        if (result.data && result.data.getScheduleById) {
          const scheduleData = result.data.getScheduleById;
          this.schedule = {
            dayOfWeek: scheduleData.dayOfWeek,
            startTime: scheduleData.startTime,
            endTime: scheduleData.endTime
          };
          this.doctorId = scheduleData.doctorId; // Almacena el doctorId si es necesario para navegar
        } else {
          this.toastService.showToast('No se encontraron datos para este horario', 'error');
          this.router.navigate(['/schedules']);
        }
      },
      error: (error) => {
        console.error('Error al cargar los datos del horario', error);
        this.toastService.showToast('Error al cargar los datos del horario', 'error');
        this.router.navigate(['/schedules']);
      }
    });
  }

  onSubmit() {
    const token = localStorage.getItem('token');

    if (this.scheduleId !== null) {
      this.apollo.mutate({
        mutation: UPDATE_SCHEDULE,
        variables: {
          scheduleId: this.scheduleId,
          scheduleInput: {
            dayOfWeek: this.schedule.dayOfWeek,
            startTime: this.schedule.startTime,
            endTime: this.schedule.endTime,
            doctorId: this.doctorId
          }
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }).subscribe({
        next: () => {
          this.toastService.showToast('Horario actualizado exitosamente', 'success');
          this.router.navigate(['/schedules', this.doctorId], { state: { refresh: true } });
        },
        error: (err) => {
          console.error('Error al actualizar el horario', err);
          this.visible = true;
          this.message = `Error al actualizar el horario: ${err.message}`;
          this.type = 'error';
          setTimeout(() => {
            this.visible = false;
          }, 3000);
        }
      });
    }
  }

  goBack() {
    if (this.doctorId) {
      this.router.navigate(['/schedules', this.doctorId]);
    } else {
      this.router.navigate(['/schedules']);
    }
  }
}
