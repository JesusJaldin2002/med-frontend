import { gql } from 'apollo-angular';

// Autenticacion

export const AUTHENTICATE_USER = gql`
  mutation Authenticate($input: AuthenticationRequestInput!) {
    authenticate(input: $input) {
      jwt
      role
      doctorId
      patientId
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;

// Patients
export const REGISTER_PATIENT = gql`
  mutation RegisterPatient(
    $patientInput: SavePatientInput!
    $userInput: SaveUserInput!
  ) {
    registerPatient(patientInput: $patientInput, userInput: $userInput) {
      id
      dateOfBirth
      gender
      phone
      address
      userId
    }
  }
`;

export const UPDATE_PATIENT = gql`
  mutation UpdatePatient(
    $patientId: Int!
    $patientInput: SavePatientInput!
    $userInput: SaveUserInput!
  ) {
    updatePatient(
      patientId: $patientId
      patientInput: $patientInput
      userInput: $userInput
    ) {
      id
      dateOfBirth
      gender
      phone
      address
      userId
    }
  }
`;

export const DELETE_PATIENT = gql`
  mutation DeletePatient($patientId: Int!) {
    deletePatient(patientId: $patientId)
  }
`;

// Doctors
export const REGISTER_DOCTOR = gql`
  mutation RegisterDoctor(
    $doctorInput: SaveDoctorInput!
    $userInput: SaveUserInput!
  ) {
    registerDoctor(doctorInput: $doctorInput, userInput: $userInput) {
      id
      specialty
      licenseNumber
      phone
      userId
    }
  }
`;

export const UPDATE_DOCTOR = gql`
  mutation UpdateDoctor(
    $doctorId: Int!
    $doctorInput: SaveDoctorInput!
    $userInput: SaveUserInput!
  ) {
    updateDoctor(
      doctorId: $doctorId
      doctorInput: $doctorInput
      userInput: $userInput
    ) {
      id
      specialty
      licenseNumber
      phone
      userId
    }
  }
`;

export const DELETE_DOCTOR = gql`
  mutation DeleteDoctor($doctorId: Int!) {
    deleteDoctor(doctorId: $doctorId)
  }
`;

// Schedules
export const REGISTER_SCHEDULE = gql`
  mutation RegisterSchedule($scheduleInput: SaveScheduleInput!) {
    registerSchedule(scheduleInput: $scheduleInput) {
      id
      dayOfWeek
      startTime
      endTime
      doctorId
    }
  }
`;

export const UPDATE_SCHEDULE = gql`
  mutation UpdateSchedule(
    $scheduleId: Int!
    $scheduleInput: SaveScheduleInput!
  ) {
    updateSchedule(scheduleId: $scheduleId, scheduleInput: $scheduleInput) {
      id
      dayOfWeek
      startTime
      endTime
      doctorId
    }
  }
`;

export const DELETE_SCHEDULE = gql`
  mutation DeleteSchedule($scheduleId: Int!) {
    deleteSchedule(scheduleId: $scheduleId)
  }
`;

// Medical Records
export const REGISTER_MEDICAL_RECORD = gql`
  mutation RegisterMedicalRecord($medicalRecordInput: SaveMedicalRecordInput!) {
    registerMedicalRecord(medicalRecordInput: $medicalRecordInput) {
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

export const UPDATE_MEDICAL_RECORD = gql`
  mutation UpdateMedicalRecord(
    $medicalRecordId: Int!
    $medicalRecordInput: SaveMedicalRecordInput!
  ) {
    updateMedicalRecord(
      medicalRecordId: $medicalRecordId
      medicalRecordInput: $medicalRecordInput
    ) {
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

export const DELETE_MEDICAL_RECORD = gql`
  mutation DeleteMedicalRecord($medicalRecordId: Int!) {
    deleteMedicalRecord(medicalRecordId: $medicalRecordId)
  }
`;

// Medical Notes
export const REGISTER_MEDICAL_NOTE = gql`
  mutation RegisterMedicalNote($medicalNoteInput: SaveMedicalNoteInput!) {
    registerMedicalNote(medicalNoteInput: $medicalNoteInput) {
      id
      noteType
      details
      date
      medicalRecordId
    }
  }
`;

export const UPDATE_MEDICAL_NOTE = gql`
  mutation UpdateMedicalNote(
    $medicalNoteId: Int!
    $medicalNoteInput: SaveMedicalNoteInput!
  ) {
    updateMedicalNote(
      medicalNoteId: $medicalNoteId
      medicalNoteInput: $medicalNoteInput
    ) {
      id
      noteType
      details
      date
      medicalRecordId
    }
  }
`;

export const DELETE_MEDICAL_NOTE = gql`
  mutation DeleteMedicalNote($medicalNoteId: Int!) {
    deleteMedicalNote(medicalNoteId: $medicalNoteId)
  }
`;

// Appointments
export const REGISTER_APPOINTMENT = gql`
  mutation RegisterAppointment($appointmentInput: SaveAppointmentInput!) {
    registerAppointment(appointmentInput: $appointmentInput) {
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

export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment(
    $appointmentId: Int!
    $appointmentInput: AppointmentInput!
  ) {
    updateAppointment(
      appointmentId: $appointmentId
      appointmentInput: $appointmentInput
    ) {
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

export const DELETE_APPOINTMENT = gql`
  mutation DeleteAppointment($appointmentId: Int!) {
    deleteAppointment(appointmentId: $appointmentId)
  }
`;

export const UPDATE_APPOINTMENT_STATUS = gql`
  mutation UpdateAppointmentStatus($appointmentId: Int!, $status: String!) {
    updateAppointmentStatus(appointmentId: $appointmentId,status: $status) {
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

// Consults
export const REGISTER_CONSULT = gql`
  mutation RegisterConsult($consultInput: SaveConsultInput!) {
    registerConsult(consultInput: $consultInput) {
      id
      date
      diagnosis
      treatment
      observations
      currentWeight
      currentHeight
      medicalRecordId
      appointmentId
      attentionTime
    }
  }
`;

export const UPDATE_CONSULT = gql`
  mutation UpdateConsult($consultId: Int!, $consultInput: SaveConsultInput!) {
    updateConsult(consultId: $consultId, consultInput: $consultInput) {
      id
      date
      diagnosis
      treatment
      observations
      currentWeight
      currentHeight
      medicalRecordId
      appointmentId
      attentionTime
    }
  }
`;

export const DELETE_CONSULT = gql`
  mutation DeleteConsult($consultId: Int!) {
    deleteConsult(consultId: $consultId)
  }
`;

// Pre Evaluation
export const REGISTER_PRE_EVALUATION = gql`
  mutation RegisterPreEvaluation($preEvaluationInput: SavePreEvaluationInput!) {
    registerPreEvaluation(preEvaluationInput: $preEvaluationInput) {
      id
      appointmentId
      symptoms
      potentialDiagnosis
    }
  }
`;
