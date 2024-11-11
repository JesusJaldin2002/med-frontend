import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { UPDATE_MEDICAL_RECORD } from '../../../graphql/mutations.graphql';
import { GET_MEDICAL_RECORD_BY_PATIENT } from '../../../graphql/queries.graphql';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-edit-medical-record',
  standalone: true,
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule]
})
export class EditComponent implements OnInit {
  medicalRecord = {
    allergies: '',
    chronicConditions: '',
    medications: '',
    bloodType: '',
    familyHistory: '',
    height: 0,
    weight: 0,
    vaccinationHistory: '',
    patientId: null
  };
  patientId: number | null = null;
  medicalRecordId: number | null = null;

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
    if (this.patientId) {
      this.loadMedicalRecordData(this.patientId);
    } else {
      this.toastService.showToast('Error: No se encontró el patientId', 'error');
      this.router.navigate(['/patients']);
    }
  }

  loadMedicalRecordData(patientId: number) {
    const token = localStorage.getItem('token');

    this.apollo.query<any>({
      query: GET_MEDICAL_RECORD_BY_PATIENT,
      variables: { patientId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result) => {
        if (result.data && result.data.getMedicalRecordByPatient) {
          const recordData = result.data.getMedicalRecordByPatient;
          this.medicalRecord = {
            allergies: recordData.allergies,
            chronicConditions: recordData.chronicConditions,
            medications: recordData.medications,
            bloodType: recordData.bloodType,
            familyHistory: recordData.familyHistory,
            height: recordData.height,
            weight: recordData.weight,
            vaccinationHistory: recordData.vaccinationHistory,
            patientId: recordData.patientId
          };
          this.medicalRecordId = recordData.id;
        } else {
          this.toastService.showToast('No se encontraron datos para esta historia clínica', 'error');
          this.router.navigate(['/patients']);
        }
      },
      error: (error) => {
        console.error('Error al cargar los datos de la historia clínica', error);
        this.toastService.showToast('Error al cargar los datos de la historia clínica', 'error');
        this.router.navigate(['/patients']);
      }
    });
  }

  onSubmit() {
    const token = localStorage.getItem('token');

    if (this.medicalRecordId !== null) {
      this.apollo.mutate({
        mutation: UPDATE_MEDICAL_RECORD,
        variables: {
          medicalRecordId: this.medicalRecordId,
          medicalRecordInput: {
            allergies: this.medicalRecord.allergies,
            chronicConditions: this.medicalRecord.chronicConditions,
            medications: this.medicalRecord.medications,
            bloodType: this.medicalRecord.bloodType,
            familyHistory: this.medicalRecord.familyHistory,
            height: this.medicalRecord.height,
            weight: this.medicalRecord.weight,
            vaccinationHistory: this.medicalRecord.vaccinationHistory,
            patientId: this.medicalRecord.patientId // No se edita, se mantiene igual
          }
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).subscribe({
        next: () => {
          this.toastService.showToast('Historia clínica actualizada exitosamente', 'success');
          this.router.navigate(['/medical-records']);
        },
        error: (err) => {
          console.error('Error al actualizar la historia clínica', err);
          this.visible = true;
          this.message = `Error al actualizar la historia clínica: ${err.message}`;
          this.type = 'error';
          setTimeout(() => {
            this.visible = false;
          }, 3000);
        }
      });
    }
  }

  goBack() {
    if (this.patientId) {
      this.router.navigate(['/patients']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
