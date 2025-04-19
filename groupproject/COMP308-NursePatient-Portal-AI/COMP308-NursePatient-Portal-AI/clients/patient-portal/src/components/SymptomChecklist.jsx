import { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import "../styles/SymptomChecklist.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { gql, useMutation } from "@apollo/client";

const ADD_SYMPTOMS_MUTATION = gql`
  mutation AddSymptoms($symptoms: [String]!) {
    addSymptoms(symptoms: $symptoms) {
      id
      symptoms
    }
  }
`;

export default function SymptomChecklist() {
  const symptoms = [
    "Fever",
    "Cough",
    "Sore Throat",
    "Runny or Stuffy Nose",
    "Muscle Aches",
    "Headache",
    "Fatigue",
    "Mucus Production",
    "Shortness of Breath",
    "Chest Pain",
    "Nausea",
    "Vomiting",
    "Lightheadedness",
    "Sweating",
    "Changes in Bowel or Bladder Habits",
    "Numbness on One Side of the Body",
    "Confusion",
    "Difficulty Speaking",
    "Trouble Seeing in One Eye",
    "Severe Headache",
    "Lump",
    "Unexplained Weight Loss",
    "Sudden Weakness",
    "Persistent Cough",
    "Unexplained Bleeding or Discharge",
    "Cuts that are Slow to Heal",
    "Indigestion",
    "Increased Thirst",
    "Frequent Urination",
    "Blurred Vision",
  ];
  const [message, setMessage] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // Mutation to add vital signs
  const [addSymptoms] = useMutation(ADD_SYMPTOMS_MUTATION);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setSelectedSymptoms((prev) =>
      checked ? [...prev, value] : prev.filter((symptom) => symptom !== value)
    );
  };

  useEffect(() => {
    console.log(selectedSymptoms);
  }, [selectedSymptoms]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      await addSymptoms({
        variables: {
          symptoms: selectedSymptoms,
        },
      });

      setSelectedSymptoms([]);

      // Uncheck all checkboxes
      document.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
        checkbox.checked = false;
      });

      setMessage("Symptoms submitted successfully!");
    } catch (err) {
      alert("Error adding vital signs: " + err.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className='form-options mb-4'>
        {symptoms.map((symptom) => (
          <Form.Check
            key={symptom}
            label={symptom}
            value={symptom}
            onChange={handleCheckboxChange}
          />
        ))}
      </div>

      {message && <p>{message}</p>}

      <Button type='submit' className='button'>
        Submit Symptoms
      </Button>
    </Form>
  );
}
