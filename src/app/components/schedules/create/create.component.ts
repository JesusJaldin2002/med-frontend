import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { REGISTER_SCHEDULE } from '../../../graphql/mutations.graphql';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-create-schedule',
  standalone: true,
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule]
})
export class CreateComponent implements OnInit {
  schedule = {
    dayOfWeek: '',
    startTime: '',
    endTime: ''
  };

  daysOfWeek: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  doctorId: number | null = null;

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
    this.doctorId = Number(this.route.snapshot.paramMap.get('doctorId'));
    if (!this.doctorId) {
      this.toastService.showToast('Error: No se encontró el doctorId', 'error');
      this.router.navigate(['/schedules']);
    }
  }

  onSubmit() {
    const token = localStorage.getItem('token');

    this.apollo.mutate({
      mutation: REGISTER_SCHEDULE,
      variables: {
        scheduleInput: {
          dayOfWeek: this.schedule.dayOfWeek,
          startTime: this.schedule.startTime,
          endTime: this.schedule.endTime,
          doctorId: this.doctorId // Agrega el doctorId desde el parámetro
        }
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }).subscribe({
      next: () => {
        this.toastService.showToast('Horario registrado exitosamente', 'success');
        this.router.navigate(['/schedules', this.doctorId ], { state: { refresh: true } });
      },
      error: (err) => {
        console.error('Error al registrar el horario', err);
        this.visible = true;
        this.message = `Error al registrar el horario: ${err.message}`;
        this.type = 'error';
        setTimeout(() => {
          this.visible = false;
        }, 3000);
      }
    });
  }

  goBack() {
    if (this.doctorId) {
      this.router.navigate(['/schedules', this.doctorId]);
    } else {
      this.router.navigate(['/schedules']);
    }
  }
}
