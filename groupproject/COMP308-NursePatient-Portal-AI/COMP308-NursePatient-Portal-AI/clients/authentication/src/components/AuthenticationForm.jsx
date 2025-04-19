import { useState } from "react";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Nav,
  Row,
  Spinner,
} from "react-bootstrap";
import "../styles/AuthenticationForm.css";
import { gql, useMutation } from "@apollo/client";
import { useAuth } from "../context/AuthContext"; // ✅ Add AuthContext

// GraphQL Mutations
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      name
      email
      role
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register(
    $name: String!
    $email: String!
    $password: String!
    $role: String!
  ) {
    register(name: $name, email: $email, password: $password, role: $role) {
      id
      name
      email
      role
    }
  }
`;

function AuthenticationForm() {
  const { setUser } = useAuth(); // ✅ From context

  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("nurse");
  const [activeTab, setActiveTab] = useState("login");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginMutation] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const user = data.login;

      setUser(user); // ✅ Update context

      // ✅ Send login event to shell
      window.dispatchEvent(
        new CustomEvent("loginSuccess", {
          detail: {
            isLoggedIn: true,
            user: user,
            token: localStorage.getItem("token"), // if you store token
          },
        })
      );

      // ✅ Optional redirect to shell root (if needed)
      window.location.href = "http://localhost:3000";
    },
    onError: (error) => setAuthError(error.message || "Login failed"),
  });

  const [register] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      loginMutation({ variables: { email, password } }); // Auto-login after register
    },
    onError: (error) => setAuthError(error.message || "Registration failed"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError("");

    if (!email || !password) {
      setAuthError("Email and password are required.");
      setIsSubmitting(false);
      return;
    }

    if (activeTab === "login") {
      await loginMutation({ variables: { email, password } });
    } else {
      await register({ variables: { name, email, password, role } });
    }

    setIsSubmitting(false);
  };

  return (
    <section className='section-auth'>
      <div className='container py-5 h-100'>
        <div className='row d-flex justify-content-center align-items-center h-100'>
          <div className='col col-xl-10'>
            <div className='card card-auth'>
              <div className='row g-0'>
                <div className='col-md-6 col-lg-5 d-none d-md-block'>
                  <img
                    src='/auth-image.webp'
                    alt='authentication form'
                    className='img-fluid image-auth'
                  />
                </div>
                <div className='col-md-6 col-lg-6 d-flex align-items-top'>
                  <div className='card-body p-2 p-lg-5 text-black'></div>
                  <Container className='p-2'>
                    <h1 className='mb-5 mt-5'>Group 1 COMP308 project 🏥</h1>
                    <Row className='justify-content-md-center'>
                      <Col>
                        <Nav
                          variant='tabs'
                          activeKey={activeTab}
                          onSelect={(k) => setActiveTab(k)}
                          className='nav-tabs'
                        >
                          <Nav.Item>
                            <Nav.Link eventKey='login'>Login</Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link eventKey='signup'>Sign Up</Nav.Link>
                          </Nav.Item>
                        </Nav>

                        {activeTab === "signup" && (
                          <>
                            <Form.Group className='mb-3 mt-3'>
                              <Form.Label>Name</Form.Label>
                              <Form.Control
                                type='text'
                                placeholder='Enter your name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                              />
                            </Form.Group>

                            <Form.Group className='mb-3'>
                              <Form.Label>Role</Form.Label>
                              <Form.Select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                              >
                                <option value='nurse'>Nurse</option>
                                <option value='patient'>Patient</option>
                              </Form.Select>
                            </Form.Group>
                          </>
                        )}

                        <Form onSubmit={handleSubmit}>
                          <Form.Group className='mb-3 mt-3'>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type='text'
                              placeholder='Enter your email'
                              value={email}
                              onChange={(e) => setemail(e.target.value)}
                            />
                          </Form.Group>

                          <Form.Group className='mb-3'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                              type='password'
                              placeholder='Enter your password'
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </Form.Group>

                          {authError && <Alert variant='danger'>{authError}</Alert>}

                          <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='w-100 mt-3 button'
                          >
                            {isSubmitting ? (
                              <Spinner
                                as='span'
                                animation='border'
                                size='sm'
                                role='status'
                                aria-hidden='true'
                              />
                            ) : activeTab === "login" ? (
                              "Login"
                            ) : (
                              "Sign Up"
                            )}
                          </Button>
                        </Form>
                      </Col>
                    </Row>
                  </Container>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthenticationForm;
