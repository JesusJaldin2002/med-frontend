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