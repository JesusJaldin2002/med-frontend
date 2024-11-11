import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { REGISTER_MEDICAL_NOTE } from '../../../graphql/mutations.graphql';
import { GET_MEDICAL_RECORD_BY_ID } from '../../../graphql/queries.graphql';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-create-medical-note',
  standalone: true,
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule]
})
export class CreateComponent implements OnInit {
  medicalNote = {
    noteType: '',
    details: '',
    date: ''
  };
  medicalRecordId: number | null = null;
  patientId: number | null = null;

  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';

  constructor(
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.medicalRecordId = Number(this.route.snapshot.paramMap.get('medicalRecordId'));
    this.medicalNote.date = new Date().toISOString().split('T')[0];
    if (!this.medicalRecordId) {
      this.toastService.showToast('Error: No se encontró el medicalRecordId', 'error');
      this.router.navigate(['/medical-records']);
      return;
    }
    this.fetchPatientId();
  }

  fetchPatientId() {
    const token = localStorage.getItem('token');
    this.apollo.query<any>({
      query: GET_MEDICAL_RECORD_BY_ID,
      variables: { medicalRecordId: this.medicalRecordId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }).subscribe(
      ({ data }) => {
        if (data && data.getMedicalRecordById) {
          this.patientId = data.getMedicalRecordById.patientId;
        } else {
          this.toastService.showToast('Error: No se encontró la historia clínica', 'error');
          this.router.navigate(['/medical-records']);
        }
      },
      (error) => {
        this.toastService.showToast('Error al obtener la historia clínica', 'error');
        this.router.navigate(['/medical-records']);
      }
    );
  }

  onSubmit() {
    const token = localStorage.getItem('token');

    this.apollo.mutate({
      mutation: REGISTER_MEDICAL_NOTE,
      variables: {
        medicalNoteInput: {
          ...this.medicalNote,
          medicalRecordId: this.medicalRecordId
        }
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }).subscribe({
      next: () => {
        this.toastService.showToast('Nota médica registrada exitosamente', 'success');
        if (this.patientId) {
          this.router.navigate(['/medical-records/show', this.patientId], { state: { refresh: true } });
        } else {
          this.router.navigate(['/medical-records']);
        }
      },
      error: (err) => {
        this.visible = true;
        this.message = `Error al registrar la nota médica: ${err.message}`;
        this.type = 'error';
        setTimeout(() => {
          this.visible = false;
        }, 3000);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
