import PropTypes from "prop-types";
import { gql, useQuery } from "@apollo/client";
import { Spinner, Alert } from "react-bootstrap";

const GET_PATIENT_SYMPTOMS_QUERY = gql`
  query GetPatientSymptoms($userId: ID!) {
    getUser(id: $userId) {
      symptoms
      symptomsRiskPrediction
    }
  }
`;

const SymptomsRisk = ({ selectedPatient }) => {
  console.log(selectedPatient.id);

  // Fetch symptoms for selected patient
  const {
    loading: symptomsLoading,
    error: symptomsError,
    data: symptomsData,
  } = useQuery(GET_PATIENT_SYMPTOMS_QUERY, {
    variables: { userId: selectedPatient.id },
    skip: !selectedPatient, // Skip query if no patient is selected
  });

  console.log(symptomsData);

  return (
    <div>
      {symptomsLoading ? (
        <Spinner animation='border' />
      ) : symptomsError ? (
        <Alert variant='danger'>
          Error loading symptoms: {symptomsError.message}
        </Alert>
      ) : selectedPatient && symptomsData.getUser.symptomsRiskPrediction ? (
        <>
          <h3>List of Syptoms</h3>
          {symptomsData.getUser.symptoms.map((symptom, index) => (
            <li key={index}>{symptom}</li>
          ))}
          <h3 className='mt-4'>Risk Prediction</h3>
          <p>
            The symptoms show a{" "}
            <b>{symptomsData.getUser.symptomsRiskPrediction}</b> health risk for
            the patient.
          </p>
        </>
      ) : (
        <p>No symptoms recorded for this patient</p>
      )}
    </div>
  );
};

SymptomsRisk.propTypes = {
  selectedPatient: PropTypes.object.isRequired,
};

export default SymptomsRisk;
