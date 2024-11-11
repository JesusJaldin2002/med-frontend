import { gql } from 'apollo-angular';
// Token
export const VALIDATE_TOKEN = gql`
  query ValidateToken {
    validateToken
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