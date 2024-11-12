import { gql } from 'apollo-angular';
// Token
export const VALIDATE_TOKEN = gql`
  query ValidateToken {
    validateToken
  }
`;

export const GET_MY_PROFILE = gql`
  query FindMyProfile {
    findMyProfile {
      id
      username
      email
      name
      role
      authorities
    }
  }
`;

// Patients
export const GET_ALL_PATIENTS = gql`
  query GetAllPatients {
    getAllPatients {
      idPatient
      name
      username
      email
      dateOfBirth
      gender
      phone
      address
      idUser
    }
  }
`;

export const GET_PATIENT_WITH_USER_BY_ID = gql`
  query GetPatientWithUserById($patientId: Int!) {
    getPatientWithUserById(patientId: $patientId) {
      idPatient
      name
      username
      email
      dateOfBirth
      gender
      phone
      address
      idUser
    }
  }
`;

// Doctors
export const GET_ALL_DOCTORS = gql`
  query GetAllDoctors {
    getAllDoctors {
      idDoctor
      name
      username
      email
      specialty
      licenseNumber
      phone
      idUser
    }
  }
`;

export const GET_DOCTOR_WITH_USER_BY_ID = gql`
  query GetDoctorWithUserById($doctorId: Int!) {
    getDoctorWithUserById(doctorId: $doctorId) {
      idDoctor
      name
      username
      email
      specialty
      licenseNumber
      phone
      idUser
    }
  }
`;

// Schedules
export const GET_ALL_SCHEDULES = gql`
  query GetAllSchedules {
    getAllSchedules {
      id
      dayOfWeek
      startTime
      endTime
      doctorId
    }
  }
`;

export const GET_SCHEDULES_BY_DOCTOR = gql`
  query GetSchedulesByDoctor($doctorId: Int!) {
    getSchedulesByDoctor(doctorId: $doctorId) {
      id
      dayOfWeek
      startTime
      endTime
      doctorId
    }
  }
`;

export const GET_SCHEDULE_BY_ID = gql`
  query GetScheduleById($scheduleId: Int!) {
    getScheduleById(scheduleId: $scheduleId) {
      id
      dayOfWeek
      startTime
      endTime
      doctorId
    }
  }
`;

// Medical Records
export const GET_ALL_MEDICAL_RECORDS = gql`
  query GetAllMedicalRecords {
    getAllMedicalRecords {
      id
      allergies
      chronicConditions
      medications
      bloodType
      familyHistory
      height
      weight
      vaccinationHistory
      patientId
    }
  }
`;

export const GET_MEDICAL_RECORD_BY_PATIENT = gql`
  query GetMedicalRecordByPatient($patientId: Int!) {
    getMedicalRecordByPatient(patientId: $patientId) {
      id
      allergies
      chronicConditions
      medications
      bloodType
      familyHistory
      height
      weight
      vaccinationHistory
      patientId
    }
  }
`;

export const GET_MEDICAL_RECORD_BY_ID = gql`
  query GetMedicalRecordById($medicalRecordId: Int!) {
    getMedicalRecordById(medicalRecordId: $medicalRecordId) {
      id
      allergies
      chronicConditions
      medications
      bloodType
      familyHistory
      height
      weight
      vaccinationHistory
      patientId
    }
  }
`;

// Medical Notes
export const GET_ALL_MEDICAL_NOTES = gql`
  query GetAllMedicalNotes {
    getAllMedicalNotes {
      id
      noteType
      details
      date
      medicalRecordId
    }
  }
`;

export const GET_MEDICAL_NOTES_BY_MEDICAL_RECORD = gql`
  query GetMedicalNotesByMedicalRecord($medicalRecordId: Int!) {
    getMedicalNotesByMedicalRecord(medicalRecordId: $medicalRecordId) {
      id
      noteType
      details
      date
      medicalRecordId
    }
  }
`;

export const GET_MEDICAL_NOTE_BY_ID = gql`
  query GetMedicalNoteById($medicalNoteId: Int!) {
    getMedicalNoteById(medicalNoteId: $medicalNoteId) {
      id
      noteType
      details
      date
      medicalRecordId
    }
  }
`;

// Appointments
export const GET_ALL_APPOINTMENTS = gql`
  query GetAllAppointments {
    getAllAppointments {
      id
      date
      time
      status
      reason
      patientId
      doctorId
    }
  }
`;

export const GET_APPOINTMENTS_BY_PATIENT = gql`
  query GetAppointmentsByPatient($patientId: Int!) {
    getAppointmentsByPatient(patientId: $patientId) {
      id
      date
      time
      status
      reason
      patientId
      doctorId
    }
  }
`;

export const GET_APPOINTMENTS_BY_DOCTOR = gql`
  query GetAppointmentsByDoctor($doctorId: Int!) {
    getAppointmentsByDoctor(doctorId: $doctorId) {
      id
      date
      time
      status
      reason
      patientId
      doctorId
    }
  }
`;