const { gql } = require("apollo-server-express");

const typeDefs = gql`
  # Updated User Type to consolidate Nurse and Patient for simplicity
  type User {
    id: ID!
    name: String!
    email: String!
    role: String! # 'nurse' or 'patient'
    assignedPatients: [User]
    assignedNurse: User
    vitalSigns: [VitalSign]
    motivationalTips: [MotivationalTip]
    symptomsRiskPrediction: String
    symptoms: [String]
  }

  type VitalSign {
    id: ID!
    bodyTemperature: Float!
    heartRate: Int!
    bloodPressure: String!
    respiratoryRate: Int!
    bodyWeight: Float!
    date: String!
  }

  type MotivationalTip {
    id: ID!
    content: String!
    createdAt: String!
    user: User
  }

  type Alert {
    id: ID!
    createdAt: String!
    user: User
  }

  type SymptomsChecklistDetails {
    symptomsRiskPrediction: String
    symptomsList: [String]
  }

  type Query {
    currentUser: User
    getUser(id: ID!): User
    listUsers(role: String): [User] # Filter by role
    getRandomMotivationalTip: MotivationalTip
    listMotivationalTips: [MotivationalTip]

    listAlerts: [Alert]

    getSymptomsChecklistDetails: SymptomsChecklistDetails
  }

  type Mutation {
    login(email: String!, password: String!): User

    register(
      name: String!
      email: String!
      password: String!
      role: String!
    ): User

    logout: Boolean

    assignPatientToNurse(patientId: ID!, nurseId: ID!): User

    addVitalSign(
      userId: ID!
      bodyTemperature: Float!
      heartRate: Int!
      bloodPressure: String!
      respiratoryRate: Int!
      bodyWeight: Float!
    ): VitalSign

    addMotivationalTip(content: String!): MotivationalTip

    updateMotivationalTip(id: ID!, content: String!): MotivationalTip

    deleteMotivationalTip(id: ID!): MotivationalTip

    addAlert: Alert
    deleteAlert(id: ID!): Alert

    updateUser(
      id: ID!
      name: String
      email: String
      password: String
      role: String
      assignedNurse: ID
      assignedPatients: [ID!]
    ): User

    addSymptoms(symptoms: [String]!): User
  }
`;

module.exports = typeDefs;
