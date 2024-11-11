import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { UPDATE_MEDICAL_NOTE } from '../../../graphql/mutations.graphql'; // Asegúrate de tener definida esta mutación
import { GET_MEDICAL_NOTE_BY_ID, GET_MEDICAL_RECORD_BY_ID } from '../../../graphql/queries.graphql';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-edit-medical-note',
  standalone: true,
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  imports: [FormModule, CommonModule, FormsModule, RouterModule, ToastModule]
})
export class EditComponent implements OnInit {
  medicalNote = {
    noteType: '',
    details: '',
    date: '',
    medicalRecordId: null
  };
  medicalNoteId: number | null = null;
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
    this.medicalNoteId = Number(this.route.snapshot.paramMap.get('medicalNoteId'));
    if (!this.medicalNoteId) {
      this.toastService.showToast('Error: No se encontró el ID de la nota médica', 'error');
      this.router.navigate(['/medical-records']);
      return;
    }
    this.loadMedicalNoteData();
  }

  loadMedicalNoteData() {
    const token = localStorage.getItem('token');
    this.apollo.query<any>({
      query: GET_MEDICAL_NOTE_BY_ID,
      variables: { medicalNoteId: this.medicalNoteId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result) => {
        if (result.data && result.data.getMedicalNoteById) {
          const noteData = result.data.getMedicalNoteById;
          this.medicalNote = {
            noteType: noteData.noteType,
            details: noteData.details,
            date: noteData.date,
            medicalRecordId: noteData.medicalRecordId
          };
          this.fetchPatientId(noteData.medicalRecordId);
        } else {
          this.toastService.showToast('No se encontraron datos para esta nota médica', 'error');
          this.router.navigate(['/medical-records']);
        }
      },
      error: (error) => {
        console.error('Error al cargar los datos de la nota médica', error);
        this.toastService.showToast('Error al cargar los datos de la nota médica', 'error');
        this.router.navigate(['/medical-records']);
      }
    });
  }

  fetchPatientId(medicalRecordId: number) {
    const token = localStorage.getItem('token');
    this.apollo.query<any>({
      query: GET_MEDICAL_RECORD_BY_ID,
      variables: { medicalRecordId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result) => {
        if (result.data && result.data.getMedicalRecordById) {
          this.patientId = result.data.getMedicalRecordById.patientId;
        } else {
          this.toastService.showToast('No se encontró el ID del paciente', 'error');
          this.router.navigate(['/medical-records']);
        }
      },
      error: (error) => {
        console.error('Error al obtener el ID del paciente', error);
        this.toastService.showToast('Error al obtener el ID del paciente', 'error');
        this.router.navigate(['/medical-records']);
      }
    });
  }

  onSubmit() {
    const token = localStorage.getItem('token');

    if (this.medicalNoteId !== null) {
      this.apollo.mutate({
        mutation: UPDATE_MEDICAL_NOTE, // Asegúrate de tener definida esta mutación
        variables: {
          medicalNoteId: this.medicalNoteId,
          medicalNoteInput: {
            noteType: this.medicalNote.noteType,
            details: this.medicalNote.details,
            date: this.medicalNote.date,
            medicalRecordId: this.medicalNote.medicalRecordId // No se edita, se mantiene igual
          }
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).subscribe({
        next: () => {
          this.toastService.showToast('Nota médica actualizada exitosamente', 'success');
          if (this.patientId) {
            this.router.navigate(['/medical-records/show', this.patientId], { state: { refresh: true } });
          } else {
            this.router.navigate(['/medical-records']);
          }
        },
        error: (err) => {
          console.error('Error al actualizar la nota médica', err);
          this.visible = true;
          this.message = `Error al actualizar la nota médica: ${err.message}`;
          this.type = 'error';
          setTimeout(() => {
            this.visible = false;
          }, 3000);
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
