import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import { GET_MEDICAL_RECORD_BY_PATIENT, GET_PATIENT_WITH_USER_BY_ID, GET_MEDICAL_NOTES_BY_MEDICAL_RECORD } from '../../../graphql/queries.graphql';
import { DELETE_MEDICAL_NOTE } from '../../../graphql/mutations.graphql'; // Importar la mutación de eliminación
import { CommonModule, Location } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModalModule, ToastModule } from '@coreui/angular';

@Component({
  selector: 'app-show-medical-record',
  standalone: true,
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss'],
  imports: [CommonModule, RouterModule, FormsModule, ModalModule, ToastModule]
})
export class ShowComponent implements OnInit, OnDestroy {
  patientId: number | null = null;
  medicalRecord: any = null;
  patientData: any = null;
  medicalNotes: any[] = [];
  loading: boolean = true;
  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';

  role: string | null = null;
  private medicalRecordQuery: QueryRef<any> | undefined;
  private medicalNotesQuery: QueryRef<any> | undefined;
  private querySubscription: Subscription | undefined;
  private notesSubscription: Subscription | undefined;
  private toastSubscription: Subscription | undefined; // Nueva suscripción para el estado del toast
  deleteModalVisible: boolean = false; // Control de visibilidad del modal de eliminación
  noteToDeleteId: number | null = null; // Almacenar el ID de la nota a eliminar

  constructor(
    private apollo: Apollo,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId'));

    if (!this.patientId) {
      this.toastService.showToast('Error: No se encontró el ID del paciente', 'error');
      this.router.navigate(['/patients']);
      return;
    }

    // Suscribirse al estado del toast
    this.toastSubscription = this.toastService.getToastState().subscribe((state) => {
      this.visible = state.visible;
      this.message = state.message;
      this.type = state.type;
    });

    this.setupDataFetching();

    if (history.state?.refresh) {
      this.refetchAllData();
    }
  }

  setupDataFetching() {
    this.fetchMedicalRecord();
    this.fetchPatientData();
  }

  fetchMedicalRecord() {
    const token = localStorage.getItem('token');

    this.medicalRecordQuery = this.apollo.watchQuery<any>({
      query: GET_MEDICAL_RECORD_BY_PATIENT,
      variables: { patientId: this.patientId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    this.querySubscription = this.medicalRecordQuery.valueChanges.subscribe(
      ({ data, loading }) => {
        this.loading = loading;
        if (data && data.getMedicalRecordByPatient) {
          this.medicalRecord = data.getMedicalRecordByPatient;
          this.fetchMedicalNotes(this.medicalRecord.id);
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
        this.toastService.showToast('Error al cargar los datos del paciente', 'error');
      }
    );
  }

  fetchMedicalNotes(medicalRecordId: number) {
    const token = localStorage.getItem('token');

    this.medicalNotesQuery = this.apollo.watchQuery<any>({
      query: GET_MEDICAL_NOTES_BY_MEDICAL_RECORD,
      variables: { medicalRecordId },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    this.notesSubscription = this.medicalNotesQuery.valueChanges.subscribe(
      ({ data }) => {
        if (data && data.getMedicalNotesByMedicalRecord) {
          this.medicalNotes = data.getMedicalNotesByMedicalRecord;
        } else {
          this.medicalNotes = [];
        }
      },
      (error) => {
        console.error('Error al cargar las notas médicas', error);
        this.toastService.showToast('Error al cargar las notas médicas', 'error');
      }
    );
  }

  refetchAllData() {
    this.medicalRecordQuery?.refetch().then(() => {
      if (this.medicalRecord?.id) {
        this.medicalNotesQuery?.refetch({ medicalRecordId: this.medicalRecord.id }).then(({ data }) => {
          if (data && data.getMedicalNotesByMedicalRecord) {
            this.medicalNotes = data.getMedicalNotesByMedicalRecord;
          } else {
            this.medicalNotes = [];
          }
        });
      }
    });
  }

  createMedicalNote() {
    if (this.medicalRecord && this.medicalRecord.id) {
      this.router.navigate(['/medical-notes/create', this.medicalRecord.id]);
    } else {
      this.toastService.showToast('Error: No se encontró el ID de la historia clínica', 'error');
    }
  }

  editMedicalNote(medicalNoteId: number) {
    this.router.navigate(['/medical-notes/edit', medicalNoteId]);
  }

  confirmDeleteMedicalNote(noteId: number) {
    this.noteToDeleteId = noteId;
    this.deleteModalVisible = true;
  }

  performDeleteMedicalNote() {
    if (this.noteToDeleteId !== null) {
      const token = localStorage.getItem('token');
      this.apollo.mutate({
        mutation: DELETE_MEDICAL_NOTE,
        variables: { medicalNoteId: this.noteToDeleteId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }).subscribe({
        next: () => {
          this.toastService.showToast('Nota médica eliminada exitosamente', 'success');
          this.refetchAllData(); // Refetch data after deletion
          this.deleteModalVisible = false;
          this.noteToDeleteId = null;
        },
        error: (err) => {
          console.error('Error al eliminar la nota médica', err);
          this.toastService.showToast('Error al eliminar la nota médica', 'error');
        },
      });
    }
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    this.notesSubscription?.unsubscribe();
    this.toastSubscription?.unsubscribe(); // Cancelar la suscripción al toast
  }
}
