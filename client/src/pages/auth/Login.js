import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, googleLogin, isAuthenticated, user, error, clearErrors } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (user?.userType ? `/${user.userType}/dashboard` : '/user/dashboard');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

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
    setIsLoading(true);

    const result = await login(formData.email, formData.password);
    const target = result?.user?.userType ? `/${result.user.userType}/dashboard` : from;
    if (result.success) {
      navigate(target, { replace: true });
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
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-box-arrow-in-right fs-4"></i>
                  </div>
                  <h3 className="fw-bold">Welcome Back</h3>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="loginEmail">
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

                  <Form.Group className="mb-3" controlId="loginPassword">
                    <Form.Label>Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
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
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      label="Remember me"
                    />
                    <Link to="/forgot-password" className="text-decoration-none">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
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
                  <span className="text-muted">Don't have an account? </span>
                  <Link to="/register" className="text-decoration-none fw-semibold">
                    Sign up here
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

export default Login;
