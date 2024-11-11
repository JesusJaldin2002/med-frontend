import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { REGISTER_MEDICAL_RECORD } from '../../../graphql/mutations.graphql';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-create-medical-record',
  standalone: true,
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule]
})
export class CreateComponent implements OnInit {
  medicalRecord = {
    allergies: '',
    chronicConditions: '',
    medications: '',
    bloodType: '',
    familyHistory: '',
    height: 0,
    weight: 0,
    vaccinationHistory: ''
  };
  patientId: number | null = null;

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
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId'));
    if (!this.patientId) {
      this.toastService.showToast('Error: No se encontró el patientId', 'error');
      this.router.navigate(['/patients']);
    }
  }

  onSubmit() {
    const token = localStorage.getItem('token');

    this.apollo.mutate({
      mutation: REGISTER_MEDICAL_RECORD,
      variables: {
        medicalRecordInput: {
          ...this.medicalRecord,
          patientId: this.patientId // Agrega el patientId desde el parámetro
        }
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }).subscribe({
      next: () => {
        this.toastService.showToast('Historia clínica registrada exitosamente', 'success');
        this.router.navigate(['/medical-records'], { state: { refresh: true } });
      },
      error: (err) => {
        console.error('Error al registrar la historia clínica', err);
        this.visible = true;
        this.message = `Error al registrar la historia clínica: ${err.message}`;
        this.type = 'error';
        setTimeout(() => {
          this.visible = false;
        }, 3000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/patients']);
  }
}
