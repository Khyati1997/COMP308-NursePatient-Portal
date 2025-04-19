import { Button } from "react-bootstrap";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";

const ADD_ALERT_MUTATION = gql`
  mutation AddAlert {
    addAlert {
      id
      createdAt
    }
  }
`;

export default function EmergencyAlert() {
  const [message, setMessage] = useState("Send an alert to all nurses!");

  // Mutations
  const [addAlert] = useMutation(ADD_ALERT_MUTATION);

  // Add a new motivational tip
  const handleSendAlert = async (event) => {
    event.preventDefault();
    setMessage("Send an alert to all nurses!");

    try {
      await addAlert();
      setMessage("Alert sent to all nurses!");
    } catch (err) {
      setMessage("Error adding Alert: " + err.message);
      alert("Error adding Alert: " + err.message);
    }
  };

  return (
    <div>
      <p>{message}</p>
      <Button onClick={handleSendAlert} className='button'>
        Send Alert
      </Button>
    </div>
  );
}
