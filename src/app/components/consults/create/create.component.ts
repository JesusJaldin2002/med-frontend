import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { REGISTER_CONSULT } from '../../../graphql/mutations.graphql';
import { FIND_PRE_EVALUATION_BY_APPOINTMENT } from '../../../graphql/queries.graphql';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { FormModule, ToastModule } from '@coreui/angular';

@Component({
  selector: 'app-create-consult',
  standalone: true,
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule]
})
export class CreateComponent implements OnInit {
  consult = {
    diagnosis: '',
    treatment: '',
    observations: '',
    currentWeight: 0.0,
    currentHeight: 0.0,
    attentionTime: ''
  };

  appointmentId: number | null = null;

  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';

  preEvaluation: any = null; // Variable para almacenar la preevaluación

  constructor(
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));
    if (!this.appointmentId) {
      this.toastService.showToast('Error: No se encontró el appointmentId', 'error');
      this.router.navigate(['/appointments']);
    }

    // Inicializar la hora de atención con la hora actual en formato HH:MM (24 horas)
    this.consult.attentionTime = this.getCurrentTime();

    // Llamar a la función para obtener la preevaluación
    this.loadPreEvaluation();
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  loadPreEvaluation() {
    if (this.appointmentId) {
      const token = localStorage.getItem('token');
      this.apollo.query({
        query: FIND_PRE_EVALUATION_BY_APPOINTMENT,
        variables: { appointmentId: this.appointmentId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).subscribe({
        next: (result: any) => {
          this.preEvaluation = result.data.findPreEvaluationByAppointment;
        },
        error: (error) => {
          console.warn('Error al obtener la preevaluación:', error);
    
        }
      });
    }
  }

  onSubmit() {
    if (!this.appointmentId) {
      this.toastService.showToast('Error: appointmentId es requerido', 'error');
      return;
    }

    const token = localStorage.getItem('token');

    this.apollo.mutate({
      mutation: REGISTER_CONSULT,
      variables: {
        consultInput: {
          ...this.consult,
          appointmentId: this.appointmentId
        }
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }).subscribe({
      next: () => {
        this.toastService.showToast('Consulta registrada exitosamente', 'success');
        this.router.navigate(['/appointments'], { state: { refresh: true } });
      },
      error: (err) => {
        console.error('Error al registrar la consulta:', err);
        this.visible = true;
        this.message = `Error al registrar la consulta: ${err.message}`;
        this.type = 'error';
        setTimeout(() => {
          this.visible = false;
        }, 3000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/appointments']);
  }
}
