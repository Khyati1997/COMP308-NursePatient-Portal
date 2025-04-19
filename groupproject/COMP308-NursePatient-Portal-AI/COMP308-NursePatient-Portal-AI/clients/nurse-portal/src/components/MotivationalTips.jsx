import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Table, Button, Form, Modal, Spinner, Alert } from "react-bootstrap";

// GraphQL Queries and Mutations
const GET_TIPS_QUERY = gql`
  query GetMotivationalTips {
    listMotivationalTips {
      id
      content
      createdAt
      user {
        name
      }
    }
  }
`;

const ADD_TIP_MUTATION = gql`
  mutation AddMotivationalTip($content: String!) {
    addMotivationalTip(content: $content) {
      id
      content
      createdAt
    }
  }
`;

const UPDATE_TIP_MUTATION = gql`
  mutation UpdateMotivationalTip($id: ID!, $content: String!) {
    updateMotivationalTip(id: $id, content: $content) {
      id
      content
      createdAt
    }
  }
`;

const DELETE_TIP_MUTATION = gql`
  mutation DeleteMotivationalTip($id: ID!) {
    deleteMotivationalTip(id: $id) {
      id
    }
  }
`;

function MotivationalTips() {
  const [newTip, setNewTip] = useState("");
  const [editingTip, setEditingTip] = useState(null);
  const [updatedContent, setUpdatedContent] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch motivational tips
  const { loading, error, data, refetch } = useQuery(GET_TIPS_QUERY);

  // Mutations
  const [addTip] = useMutation(ADD_TIP_MUTATION);
  const [updateTip] = useMutation(UPDATE_TIP_MUTATION);
  const [deleteTip] = useMutation(DELETE_TIP_MUTATION);

  // Add a new motivational tip
  const handleAddTip = async (event) => {
    event.preventDefault();
    try {
      await addTip({ variables: { content: newTip } });
      setNewTip("");
      refetch(); // Refresh the list
    } catch (err) {
      alert("Error adding tip: " + err.message);
    }
  };

  // Update a motivational tip
  const handleUpdateTip = async () => {
    try {
      await updateTip({
        variables: { id: editingTip.id, content: updatedContent },
      });
      setEditingTip(null);
      setShowModal(false);
      refetch();
      alert("Motivational tip updated successfully!");
    } catch (err) {
      alert("Error updating tip: " + err.message);
    }
  };

  // Delete a motivational tip
  const handleDeleteTip = async (id) => {
    if (window.confirm("Are you sure you want to delete this tip?")) {
      try {
        await deleteTip({ variables: { id } });
        refetch();
      } catch (err) {
        alert("Error deleting tip: " + err.message);
      }
    }
  };

  if (loading) return <Spinner animation='border' />;
  if (error)
    return <Alert variant='danger'>Error loading tips: {error.message}</Alert>;

  return (
    <div>
      {/* Add New Tip */}
      <Form onSubmit={handleAddTip}>
        <Form.Group className='mb-4'>
          <Form.Label>Enter Motivational Tip</Form.Label>
          <Form.Control
            as='textarea'
            rows={3}
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
          />
        </Form.Group>
        <Button type='submit' className='button mb-4'>
          Add Motivational Tip
        </Button>
      </Form>

      {/* Motivational Tips Table */}
      <Table striped bordered hover className='mt-4'>
        <thead>
          <tr>
            <th>Creator</th>
            <th>Content</th>
            <th>Created At</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.listMotivationalTips.map((tip) => (
            <tr key={tip.id}>
              <td>{tip.user?.name}</td>
              <td>{tip.content}</td>
              <td>{new Date(parseInt(tip.createdAt)).toLocaleString()}</td>
              <td>
                <div
                  onClick={() => {
                    setEditingTip(tip);
                    setUpdatedContent(tip.content);
                    setShowModal(true);
                  }}
                >
                  <img src='./edit.png' alt='Edit Button' className='icon' />
                </div>

                <div onClick={() => handleDeleteTip(tip.id)}>
                  <img src='./trash.png' alt='Delete Button' className='icon' />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Tip Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Tip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Edit Content</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              value={updatedContent}
              onChange={(e) => setUpdatedContent(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={handleUpdateTip}
            className='button'
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MotivationalTips;
alert;
