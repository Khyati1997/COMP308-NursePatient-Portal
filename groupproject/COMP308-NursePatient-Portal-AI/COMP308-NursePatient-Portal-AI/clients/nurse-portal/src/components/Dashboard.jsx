import { useState, useEffect } from "react";
import { Form, Spinner, Alert, Container, Row, Col } from "react-bootstrap";
import { gql, useQuery } from "@apollo/client";
import MotivationalTips from "./MotivationalTips";
import ClinicalVisits from "./ClinicalVisits";
import VitalsForm from "./VitalsForm";
import SymptomRisk from "./SymptomRisk";
import AlertPopup from "./AlertPopup";

// GraphQL query to check the current user's authentication status
const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      name
      email
      role
      vitalSigns {
        id
        bodyTemperature
        heartRate
        bloodPressure
        respiratoryRate
        date
      }
      symptomsRiskPrediction
      symptoms
    }
  }
`;

const GET_PATIENTS_QUERY = gql`
  query GetPatients {
    listUsers(role: "patient") {
      id
      name
    }
  }
`;

export default function Dashboard() {
  const [focus, setFocus] = useState("Dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentAuthUser, setCurrentAuthUser] = useState(null);

  const {
    loading: patientsLoading,
    error: patientsError,
    data: patientsData,
  } = useQuery(GET_PATIENTS_QUERY);

  const { loading, error, data } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!loading && !error) {
      setCurrentAuthUser(data.currentUser);
    }
  }, [loading, error, data]);

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    if (patientId === "") {
      setSelectedPatient(null);
    } else {
      setSelectedPatient({
        id: patientId,
        name: e.target.options[e.target.selectedIndex].text,
      });
    }
  };

  return (
    <div>
      <Container className='mb-5'>
        {/* ************ MOTIVATIONAL TIPS POPUP ************ */}
        {focus === "Tips" && (
  <>
    <div
      className="dashboard-tips-overlay"
      onClick={() => setFocus("Dashboard")}
    />

    <div className="dashboard-tips-popup">
      <button className="close-button" onClick={() => setFocus("Dashboard")}>✖</button>
      <h2 className="dashboad-title">📝 Motivational Tips</h2>
      <MotivationalTips />
    </div>
  </>
)}


        {/* ************ ALERT POPUP ************ */}
        {focus === "Alert" && (
  <>
    <div
      className="dashboard-tips-overlay"
      onClick={() => setFocus("Dashboard")}
    />

    <div className="dashboard-tips-popup">
      <button
        className="close-button"
        onClick={() => setFocus("Dashboard")}
      >
        ✖
      </button>

      <h2 className="dashboad-title">🚨 Emergency Alerts</h2>
      <p>Patients in needs!</p>
      <AlertPopup />
    </div>
  </>
)}


        {/* ************ HEADER ************ */}
        <div className='dashboard-tile dashboard-header'>
          <h2 className='dashboad-title'>
            🩺 Nurse Portal{" "}
            {currentAuthUser?.name ? "- Welcome " + currentAuthUser.name : ""}
          </h2>
          <a className='link' href='#' onClick={() => setFocus("Tips")}>
            Manage Motivational Tips
          </a>
          <a className='link' href='#' onClick={() => setFocus("Alert")}>
            View Alerts
          </a>
        </div>

        {/* ************ PATIENT DROPDOWN ************ */}
        <div className='dashboard-header'>
          {patientsLoading ? (
            <Spinner animation='border' />
          ) : patientsError ? (
            <Alert variant='danger'>
              Error loading patients: {patientsError.message}
            </Alert>
          ) : (
            <Form.Group>
              <Form.Label>Select a patient</Form.Label>
              <Form.Select
                value={selectedPatient?.id || ""}
                onChange={handlePatientChange}
              >
                <option value=''>-- Select a patient --</option>
                {patientsData?.listUsers.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </div>

        {/* ************ CONTENT TILES ************ */}
        {selectedPatient ? (
          <Row className='g-4'>
            <Col xs={12} md={6}>
              <div className='dashboard-tile dashboard-vitals h-100'>
                <h2 className='dashboad-title'>Clinical Records</h2>
                <ClinicalVisits selectedPatient={selectedPatient} />
              </div>
            </Col>

            <Col xs={12} md={6}>
              <div className='dashboard-tile dashboard-vitals mb-4'>
                <h2 className='dashboad-title'>Add Vitals</h2>
                <VitalsForm selectedPatient={selectedPatient} />
              </div>

              <div className='dashboard-tile dashboard-emergency-alert'>
                <h2 className='dashboad-title'>Latest Symptom Checklist Details</h2>
                <SymptomRisk selectedPatient={selectedPatient} />
              </div>
            </Col>
          </Row>
        ) : (
          <Alert variant='info' className='mt-4'>
            Please select a patient to view or submit clinical data.
          </Alert>
        )}
      </Container>

      <footer className={selectedPatient ? "" : "fixed-footer"}>
        Final Group Assignment Group 1
      </footer>
    </div>
  );
}
