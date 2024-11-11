import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { GET_MEDICAL_RECORD_BY_PATIENT, GET_PATIENT_WITH_USER_BY_ID } from '../../../graphql/queries.graphql';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-show-medical-record',
  standalone: true,
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss'],
  imports: [CommonModule, RouterModule, FormsModule]
})
export class ShowComponent implements OnInit {
  patientId: number | null = null;
  medicalRecord: any = null;
  patientData: any = null;
  loading: boolean = true;
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
      this.toastService.showToast('Error: No se encontró el ID del paciente', 'error');
      this.router.navigate(['/patients']);
      return;
    }
    this.fetchMedicalRecord();
    this.fetchPatientData();
  }

  fetchMedicalRecord() {
    const token = localStorage.getItem('token');
    this.apollo.query<any>({
      query: GET_MEDICAL_RECORD_BY_PATIENT,
      variables: { patientId: this.patientId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }).subscribe(
      ({ data, loading }) => {
        this.loading = loading;
        if (data && data.getMedicalRecordByPatient) {
          this.medicalRecord = data.getMedicalRecordByPatient;
        } else {
          this.toastService.showToast('No se encontró la historia clínica para este paciente', 'error');
          this.medicalRecord = null;
        }
      },
      (error) => {
        console.error('Error al cargar la historia clínica', error);
        this.toastService.showToast('Error al cargar la historia clínica', 'error');
      }
    );
  }

  fetchPatientData() {
    const token = localStorage.getItem('token');
    this.apollo.query<any>({
      query: GET_PATIENT_WITH_USER_BY_ID,
      variables: { patientId: this.patientId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }).subscribe(
      ({ data }) => {
        if (data && data.getPatientWithUserById) {
          this.patientData = data.getPatientWithUserById;
        } else {
          this.toastService.showToast('No se encontró la información del paciente', 'error');
          this.patientData = null;
        }
      },
      (error) => {
        console.error('Error al cargar los datos del paciente', error);
        this.toastService.showToast('Error al cargar los datos del paciente', 'error');
      }
    );
  }

  createMedicalNote() {
    // Aquí puedes agregar la lógica para crear una nota médica
    this.toastService.showToast('Función de creación de nota médica aún no implementada', 'success');
  }

  goBack() {
    this.router.navigate(['/patients']);
  }
}
