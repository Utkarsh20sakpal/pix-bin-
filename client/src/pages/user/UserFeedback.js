import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category: 'website',
    subject: '',
    message: '',
    rating: 5
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/feedback');
      setFeedback(response.data.data.feedback);
    } catch (error) {
      setError('Failed to load feedback history');
      toast.error('Failed to load feedback history');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/user/feedback', formData);
      toast.success('Feedback submitted successfully!');
      setFormData({
        category: 'website',
        subject: '',
        message: '',
        rating: 5
      });
      fetchFeedback();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      'in-progress': { variant: 'info', text: 'In Progress' },
      resolved: { variant: 'success', text: 'Resolved' },
      closed: { variant: 'secondary', text: 'Closed' }
    };
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <span className={`badge bg-${config.variant}`}>{config.text}</span>;
  };

  // Removed unused getPriorityBadge helper

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading feedback...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold">Feedback</h1>
          <p className="text-muted">Share your thoughts and report issues</p>
        </Col>
      </Row>

      <Row>
        {/* Submit Feedback Form */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Submit Feedback</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="feedbackCategory">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    autoComplete="section-feedback category"
                    required
                  >
                    <option value="website">Website</option>
                    <option value="app">Mobile App</option>
                    <option value="service">Service</option>
                    <option value="hardware">Hardware</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="feedbackSubject">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief description of your feedback"
                    autoComplete="section-feedback subject"
                    required
                    maxLength={100}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="feedbackMessage">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Detailed description of your feedback or issue"
                    autoComplete="section-feedback message"
                    required
                    maxLength={1000}
                  />
                  <Form.Text className="text-muted">
                    {formData.message.length}/1000 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Rating</Form.Label>
                  <div className="d-flex align-items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="link"
                        className="p-0 me-1"
                        onClick={() => setFormData({...formData, rating: star})}
                      >
                        <i className={`bi bi-star${star <= formData.rating ? '-fill' : ''} text-warning fs-4`}></i>
                      </Button>
                    ))}
                    <span className="ms-2 text-muted">
                      {formData.rating} out of 5 stars
                    </span>
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Feedback History */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Your Feedback History</h5>
            </Card.Header>
            <Card.Body>
              {feedback && feedback.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '150px' }} title={item.subject}>
                              {item.subject}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {item.category}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`bi bi-star${star <= item.rating ? '-fill' : ''} text-warning`}
                                  style={{ fontSize: '0.8rem' }}
                                ></i>
                              ))}
                            </div>
                          </td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td>
                            <small className="text-muted">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-chat-dots display-4 text-muted"></i>
                  <p className="text-muted mt-3">No feedback submitted yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserFeedback;
