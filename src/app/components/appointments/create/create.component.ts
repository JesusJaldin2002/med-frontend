import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { REGISTER_APPOINTMENT } from '../../../graphql/mutations.graphql';
import {
  GET_ALL_PATIENTS,
  GET_ALL_DOCTORS,
  GET_SCHEDULES_BY_DOCTOR,
  GET_APPOINTMENTS_BY_DOCTOR,
} from '../../../graphql/queries.graphql';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { FormModule, ToastModule } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  standalone: true,
  imports: [FormModule, CommonModule, FormsModule, ToastModule],
})
export class CreateComponent implements OnInit {
  appointment = {
    date: '',
    time: '',
    reason: '',
    patientId: null as number | null,
    doctorId: null as number | null,
  };

  patients: any[] = [];
  filteredPatients: any[] = [];
  doctors: any[] = [];
  filteredDoctors: any[] = [];
  schedules: any[] = [];
  availableTimes: string[] = [];
  suggestedDates: string[] = [];

  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';

  loadingSchedules: boolean = false;
  token = localStorage.getItem('token');

  searchPatient: string = '';
  searchDoctor: string = '';

  constructor(
    private apollo: Apollo,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.fetchPatients();
    this.fetchDoctors();
  }

  fetchPatients() {
    this.apollo
      .query<any>({
        query: GET_ALL_PATIENTS,
        context: { headers: { Authorization: `Bearer ${this.token}` } },
      })
      .subscribe(
        ({ data }) => {
          this.patients = data.getAllPatients;
          this.filteredPatients = [...this.patients];
        },
        (error) => {
          console.error('Error fetching patients', error);
          this.toastService.showToast('Error fetching patients', 'error');
        }
      );
  }

  fetchDoctors() {
    this.apollo
      .query<any>({
        query: GET_ALL_DOCTORS,
        context: { headers: { Authorization: `Bearer ${this.token}` } },
      })
      .subscribe(
        ({ data }) => {
          this.doctors = data.getAllDoctors;
          this.filteredDoctors = [...this.doctors];
        },
        (error) => {
          console.error('Error fetching doctors', error);
          this.toastService.showToast('Error fetching doctors', 'error');
        }
      );
  }

  onDoctorChange() {
    if (this.appointment.doctorId) {
      this.appointment.doctorId = Number(this.appointment.doctorId);
      this.fetchSchedulesForDoctor(this.appointment.doctorId);
    } else {
      this.schedules = [];
      this.availableTimes = [];
      this.suggestedDates = [];
    }
  }

  fetchSchedulesForDoctor(doctorId: number) {
    this.loadingSchedules = true;
    this.apollo
      .query<any>({
        query: GET_SCHEDULES_BY_DOCTOR,
        variables: { doctorId },
        context: { headers: { Authorization: `Bearer ${this.token}` } },
      })
      .subscribe(
        ({ data }) => {
          this.schedules = data.getSchedulesByDoctor;
          this.loadingSchedules = false;
          if (this.schedules.length > 0) {
            // Genera fechas sugeridas y horas disponibles para el primer horario automáticamente
            this.onScheduleChangeInitial(this.schedules[0]);
          }
        },
        (error) => {
          console.error('Error fetching schedules', error);
          this.toastService.showToast('Error fetching schedules', 'error');
          this.loadingSchedules = false;
        }
      );
  }

  // Nueva función para manejar el cambio inicial del horario y generar fechas y horas
  onScheduleChangeInitial(schedule: any) {
    this.generateSuggestedDates(schedule.dayOfWeek);
    this.appointment.date =
      this.suggestedDates.length > 0 ? this.suggestedDates[0] : '';
    this.generateAvailableTimes(schedule);
  }

  generateAvailableTimes(schedule: any) {
    const times: string[] = [];
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(
        currentMinute
      ).padStart(2, '0')}`;
      times.push(timeString);

      currentMinute += 20;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    this.filterAvailableTimes(times);
  }

  filterAvailableTimes(times: string[]) {
    if (!this.appointment.doctorId || !this.appointment.date) {
      this.availableTimes = [];
      return;
    }

    const doctorId = Number(this.appointment.doctorId);

    this.apollo
      .query<any>({
        query: GET_APPOINTMENTS_BY_DOCTOR,
        variables: { doctorId },
        context: { headers: { Authorization: `Bearer ${this.token}` } },
      })
      .subscribe(
        ({ data }) => {
          const takenTimes = data.getAppointmentsByDoctor
            .filter(
              (appointment: any) => appointment.date === this.appointment.date
            )
            .map((appointment: any) => appointment.time);

          // Filtramos las horas disponibles eliminando las tomadas
          this.availableTimes = times.filter(
            (time) => !takenTimes.includes(time)
          );
        },
        (error) => {
          console.error('Error fetching appointments', error);
          this.toastService.showToast('Error fetching appointments', 'error');
        }
      );
  }

  filterPatients() {
    if (!this.searchPatient) {
      this.filteredPatients = [...this.patients];
    } else {
      this.filteredPatients = this.patients.filter(
        (patient) =>
          patient.name
            .toLowerCase()
            .includes(this.searchPatient.toLowerCase()) ||
          patient.username
            .toLowerCase()
            .includes(this.searchPatient.toLowerCase())
      );
    }
  }

  filterDoctors() {
    if (!this.searchDoctor) {
      this.filteredDoctors = [...this.doctors];
    } else {
      this.filteredDoctors = this.doctors.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(this.searchDoctor.toLowerCase()) ||
          doctor.specialty
            .toLowerCase()
            .includes(this.searchDoctor.toLowerCase())
      );
    }
  }

  navigateToAppointments() {
    this.router.navigate(['/appointments']);
  }

  onScheduleChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedSchedule = this.schedules.find(
      (schedule) =>
        `${schedule.dayOfWeek} ${schedule.startTime} - ${schedule.endTime}` ===
        selectElement.value
    );
  
    if (selectedSchedule) {
      this.generateSuggestedDates(selectedSchedule.dayOfWeek);
      this.appointment.date = this.suggestedDates.length > 0 ? this.suggestedDates[0] : '';
      this.generateAvailableTimes(selectedSchedule);
    }
  }

  onDateChange() {
    if (this.appointment.date && this.appointment.doctorId) {
      const selectedSchedule = this.schedules.find(
        (schedule) =>
          schedule.dayOfWeek === this.getDayOfWeek(this.appointment.date)
      );
      if (selectedSchedule) {
        this.generateAvailableTimes(selectedSchedule);
      }
    }
  }

  generateSuggestedDates(dayOfWeek: string) {
    // Filtra las fechas sugeridas solo para el día de la semana seleccionado
    const today = new Date();
    const daysOfWeek = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
  
    let date = new Date(today);
    // Calcula la fecha más cercana que coincida con el día seleccionado
    date.setDate(date.getDate() + ((7 + targetDayIndex - today.getDay()) % 7));
  
    // Reinicia el arreglo de fechas sugeridas antes de agregar nuevas fechas
    this.suggestedDates = [];
  
    // Genera las 3 próximas fechas solo para el día seleccionado
    for (let i = 0; i < 3; i++) {
      this.suggestedDates.push(date.toISOString().split('T')[0]);
      date.setDate(date.getDate() + 7);
    }
  }

  getDayOfWeek(date: string): string {
    const dateObj = new Date(date);
    const daysOfWeek = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return daysOfWeek[dateObj.getDay()];
  }

  onSubmit() {
    const appointmentInput = {
      ...this.appointment,
      patientId: Number(this.appointment.patientId),
      doctorId: Number(this.appointment.doctorId),
    };

    this.apollo
      .mutate({
        mutation: REGISTER_APPOINTMENT,
        variables: { appointmentInput },
        context: { headers: { Authorization: `Bearer ${this.token}` } },
      })
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'Appointment registered successfully',
            'success'
          );
          this.router.navigate(['/appointments'], { state: { refresh: true } });
        },
        error: (err) => {
          console.error('Error registering appointment', err);
          this.visible = true;
          this.message = `Error registering appointment: ${err.message}`;
          this.type = 'error';
          setTimeout(() => {
            this.visible = false;
          }, 3000);
        },
      });
  }
}
