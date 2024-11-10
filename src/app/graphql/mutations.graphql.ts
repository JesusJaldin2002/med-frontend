import { gql } from 'apollo-angular';

// Autenticacion

export const AUTHENTICATE_USER = gql`
  mutation Authenticate($input: AuthenticationRequestInput!) {
    authenticate(input: $input) {
      jwt
      role
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

export const REGISTER_PATIENT = gql`
  mutation RegisterPatient($patientInput: SavePatientInput!, $userInput: SaveUserInput!) {
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
  mutation UpdatePatient($patientId: Int!, $patientInput: SavePatientInput!, $userInput: SaveUserInput!) {
    updatePatient(patientId: $patientId, patientInput: $patientInput, userInput: $userInput) {
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