import { gql, useQuery, useMutation } from "@apollo/client";
import { Table, Spinner, Alert } from "react-bootstrap";

// GraphQL Queries and Mutations
const GET_ALERTS_QUERY = gql`
  query ListAlerts {
    listAlerts {
      id
      createdAt
      user {
        name
      }
    }
  }
`;

const DELETE_ALERT_MUTATION = gql`
  mutation DeleteAlert($id: ID!) {
    deleteAlert(id: $id) {
      id
    }
  }
`;

export default function AlertPopup() {
  // Fetch motivational tips
  const { loading, error, data, refetch } = useQuery(GET_ALERTS_QUERY);

  // Mutations
  const [deleteAlert] = useMutation(DELETE_ALERT_MUTATION);

  // Delete a motivational tip
  const handleDeleteAlert = async (id) => {
    if (window.confirm("Are you sure you want to delete this Alert?")) {
      try {
        await deleteAlert({ variables: { id } });
        refetch();
      } catch (err) {
        alert("Error deleting alert: " + err.message);
      }
    }
  };

  if (loading) return <Spinner animation='border' />;
  if (error)
    return <Alert variant='danger'>Error loading tips: {error.message}</Alert>;

  return (
    <div>
      <h3>Patients in needs!</h3>

      {/* Motivational Tips Table */}
      <Table striped bordered hover className='mt-4'>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Created At</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.listAlerts.map((alert) => (
            <tr key={alert.id}>
              <td>{alert.user?.name}</td>
              <td>{new Date(parseInt(alert.createdAt)).toLocaleString()}</td>
              <td>
                <div onClick={() => handleDeleteAlert(alert.id)}>
                  <img src='./trash.png' alt='Delete Button' className='icon' />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
