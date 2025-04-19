import "bootstrap/dist/css/bootstrap.min.css";
import { Nav } from "react-bootstrap";
import { gql, useMutation } from "@apollo/client";
import "../styles/Navbar.css";
import PropTypes from "prop-types";

// Mutation to logout
const LOGOUT_USER_MUTATION = gql`
  mutation {
    logout
  }
`;

export default function Navbar({ currentAuthUser }) {
  const [logout] = useMutation(LOGOUT_USER_MUTATION, {
    onCompleted: (data) => {
      if (data.logout) {
        localStorage.clear(); // Optional: clear any user/token
        window.location.reload(); // Refresh shell to re-check login state
      }
    },
    onError: (error) => {
      console.error("Logout failed:", error.message);
    },
  });

  return (
    <Nav className='navbar navbar-expand-lg navbar-light bg-light mb-4'>
      <div className='container-fluid'>
        <a className='navbar-brand fw-bold' href='#'>
          Group 1 Project 🏥
        </a>

        <div className='navbar-nav'>
          <span className='nav-link non-selectable nav-welcome'>
            Welcome, {currentAuthUser?.name}
          </span>
          <a
            className='nav-link non-selectable nav-button'
            role='button'
            onClick={logout}
          >
            Logout
          </a>
        </div>
      </div>
    </Nav>
  );
}

Navbar.propTypes = {
  currentAuthUser: PropTypes.object,
};
