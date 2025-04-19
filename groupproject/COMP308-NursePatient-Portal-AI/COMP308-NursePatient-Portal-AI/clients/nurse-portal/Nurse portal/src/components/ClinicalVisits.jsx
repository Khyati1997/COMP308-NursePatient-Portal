import PropTypes from "prop-types";
import { gql, useQuery } from "@apollo/client";
import { Table, Spinner, Alert } from "react-bootstrap";

const GET_PATIENT_VITAL_SIGNS_QUERY = gql`
  query GetPatientVitalSigns($userId: ID!) {
    getUser(id: $userId) {
      vitalSigns {
        id
        bodyTemperature
        heartRate
        bloodPressure
        respiratoryRate
        bodyWeight
        date
      }
    }
  }
`;

function ClinicalVisits({ selectedPatient }) {
  // Fetch vital signs for selected patient
  const {
    loading: vitalsLoading,
    error: vitalsError,
    data: vitalsData,
  } = useQuery(GET_PATIENT_VITAL_SIGNS_QUERY, {
    variables: { userId: selectedPatient.id },
    skip: !selectedPatient, // Skip query if no patient is selected
  });

  return (
    <div>
      {/* Vital Signs Table */}
      {vitalsLoading ? (
        <Spinner animation='border' />
      ) : vitalsError ? (
        <Alert variant='danger'>
          Error loading vital signs: {vitalsError.message}
        </Alert>
      ) : selectedPatient &&
        vitalsData &&
        vitalsData.getUser.vitalSigns.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Body Temperature</th>
              <th>Heart Rate</th>
              <th>Blood Pressure</th>
              <th>Respiratory Rate</th>
              <th>Body Weight</th>
            </tr>
          </thead>
          <tbody>
            {vitalsData.getUser.vitalSigns
              .slice()
              .reverse()
              .map((vital) => (
                <tr key={vital.id}>
                  <td>{new Date(parseInt(vital.date)).toLocaleString()}</td>
                  <td>
                    {vital.bodyTemperature
                      ? vital.bodyTemperature + "  °C"
                      : ""}
                  </td>
                  <td>{vital.heartRate ? vital.heartRate + "  bpm" : ""}</td>
                  <td>
                    {vital.bloodPressure ? vital.bloodPressure + "  mm Hg" : ""}
                  </td>
                  <td>
                    {vital.respiratoryRate
                      ? vital.respiratoryRate + "  breaths/min"
                      : ""}
                  </td>
                  <td>{vital.bodyWeight ? vital.bodyWeight + " kg" : ""}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      ) : (
        selectedPatient && (
          <p>No clinical visits found for {selectedPatient.name}.</p>
        )
      )}
    </div>
  );
}
ClinicalVisits.propTypes = {
  selectedPatient: PropTypes.object.isRequired,
};

export default ClinicalVisits;
