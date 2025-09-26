import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Accordion, Spinner, Alert, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const CustomerCare = () => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState('');
  const [sendError, setSendError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/faq');
      setFaqData(response.data.data);
    } catch (error) {
      setError('Failed to load FAQ data');
      toast.error('Failed to load FAQ data');
    } finally {
      setLoading(false);
    }
  };

  const groupFAQByCategory = (faqs) => {
    return faqs.reduce((groups, faq) => {
      const category = faq.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(faq);
      return groups;
    }, {});
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    setSentMsg('');
    setSendError('');
    try {
      const res = await axios.post('/api/support/email', form);
      setSentMsg(res.data.message || 'Your message has been sent.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send message';
      setSendError(msg);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading FAQ...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <button
            className="btn btn-outline-danger btn-sm ms-3"
            onClick={fetchFAQ}
          >
            Retry
          </button>
        </Alert>
      </Container>
    );
  }

  const groupedFAQ = groupFAQByCategory(faqData);

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-3">Customer Care</h1>
            <p className="lead text-muted">
              Find answers to common questions and get support for our IoT waste segregator system
            </p>
          </div>
        </Col>
      </Row>

      {/* Contact Info */}
      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Body className="p-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-envelope fs-4"></i>
              </div>
              <h5 className="card-title">Email Support</h5>
              <p className="text-muted">Get help via email</p>
              <a href="mailto:support@wastesegregator.com" className="btn btn-outline-primary">
                support@wastesegregator.com
              </a>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Body className="p-4">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-telephone fs-4"></i>
              </div>
              <h5 className="card-title">Phone Support</h5>
              <p className="text-muted">Call us for immediate help</p>
              <a href="tel:+15551234567" className="btn btn-outline-success">
                +1 (555) 123-4567
              </a>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Body className="p-4">
              <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-chat-dots fs-4"></i>
              </div>
              <h5 className="card-title">Live Chat</h5>
              <p className="text-muted">Chat with our support team</p>
              <button className="btn btn-outline-warning" disabled>
                Coming Soon
              </button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FAQ Section */}
      <Row>
        <Col>
          <h2 className="text-center mb-5">Frequently Asked Questions</h2>
          
          {Object.keys(groupedFAQ).map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-5">
              <h4 className="mb-4 text-primary">{category}</h4>
              <Accordion>
                {groupedFAQ[category].map((faq, faqIndex) => (
                  <Accordion.Item key={faq.id} eventKey={`${categoryIndex}-${faqIndex}`}>
                    <Accordion.Header>
                      <strong>{faq.question}</strong>
                    </Accordion.Header>
                    <Accordion.Body>
                      <p className="mb-0">{faq.answer}</p>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          ))}
        </Col>
      </Row>

      {/* Additional Support */}
      <Row className="mt-5">
        <Col>
          <Card className="bg-light">
            <Card.Body className="text-center p-5">
              <h3 className="mb-3">Still Need Help?</h3>
              <p className="text-muted mb-4">
                Can't find what you're looking for? Our support team is here to help you 24/7.
              </p>
              <Row className="justify-content-center">
                <Col md={8} lg={6}>
                  {sentMsg && <Alert variant="success" className="text-start">{sentMsg}</Alert>}
                  {sendError && <Alert variant="danger" className="text-start">{sendError}</Alert>}
                  <Form onSubmit={sendEmail} className="text-start">
                    <Form.Group className="mb-3" controlId="careName">
                      <Form.Label>Your Name</Form.Label>
                      <Form.Control name="name" value={form.name} onChange={handleInput} autoComplete="name" required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="careEmail">
                      <Form.Label>Your Email</Form.Label>
                      <Form.Control type="email" name="email" value={form.email} onChange={handleInput} autoComplete="email" required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="careSubject">
                      <Form.Label>Subject</Form.Label>
                      <Form.Control name="subject" value={form.subject} onChange={handleInput} autoComplete="section-support subject" required />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="careMessage">
                      <Form.Label>Message</Form.Label>
                      <Form.Control as="textarea" rows={5} name="message" value={form.message} onChange={handleInput} autoComplete="section-support message" required minLength={10} />
                    </Form.Group>
                    <div className="d-grid">
                      <Button type="submit" variant="primary" disabled={sending}>
                        {sending ? (<><Spinner animation="border" size="sm" className="me-2" />Sending...</>) : (<><i className="bi bi-envelope me-2"></i>Send Email</>)}
                      </Button>
                    </div>
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerCare;
