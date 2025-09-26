import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, googleLogin, isAuthenticated, user, error, clearErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const target = user?.userType ? `/${user.userType}/dashboard` : '/user/dashboard';
      navigate(target);
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      const target = result?.user?.userType ? `/${result.user.userType}/dashboard` : `/${userData.userType}/dashboard`;
      navigate(target);
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  if (isAuthenticated) {
    return <LoadingSpinner text="Redirecting to dashboard..." />;
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-person-plus fs-4"></i>
                  </div>
                  <h3 className="fw-bold">Create Account</h3>
                  <p className="text-muted">Join our waste management community</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="registerName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="registerEmail">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="registerUserType">
                    <Form.Label>User Type</Form.Label>
                    <Form.Select
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      autoComplete="section-register user-type"
                      required
                    >
                      <option value="user">User</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="collector">Collector</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Choose your role in the waste management system
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="registerPassword">
                    <Form.Label>Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ zIndex: 10 }}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Password must be at least 6 characters long
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="registerConfirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                    />
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <Form.Text className="text-danger">
                        Passwords do not match
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3"
                    disabled={isLoading || formData.password !== formData.confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </Form>

                <div className="text-center mb-3">
                  <span className="text-muted">or</span>
                </div>

                <Button
                  variant="outline-primary"
                  size="lg"
                  className="w-100 mb-4"
                  onClick={handleGoogleLogin}
                >
                  <i className="bi bi-google me-2"></i>
                  Continue with Google
                </Button>

                <div className="text-center">
                  <span className="text-muted">Already have an account? </span>
                  <Link to="/login" className="text-decoration-none fw-semibold">
                    Sign in here
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
