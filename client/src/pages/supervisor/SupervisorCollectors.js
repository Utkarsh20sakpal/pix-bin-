import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

const SupervisorCollectors = () => {
  const [collectors, setCollectors] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assign, setAssign] = useState({ collectorId: '', binIds: '' });
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, bRes] = await Promise.all([
        axios.get('/api/supervisor/collectors'),
        axios.get('/api/supervisor/bins')
      ]);
      setCollectors(cRes.data.data || []);
      setBins((bRes.data.data || []).slice(0, 200));
    } catch (e) {
      setError('Failed to load collectors/bins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetchData(); },[]);

  const assignBins = async () => {
    try {
      setSending(true);
      const binIds = assign.binIds.split(',').map(s=>s.trim()).filter(Boolean);
      await axios.put('/api/supervisor/assign-bins', { collectorId: assign.collectorId, binIds });
      await fetchData();
    } catch (e) {
      setError('Failed to assign bins');
    } finally {
      setSending(false);
    }
  };

  const sendInstruction = async (collectorId) => {
    try {
      await axios.post('/api/supervisor/send-instruction', { collectorId, instruction: 'Please prioritize full bins', priority: 'high' });
    } catch (e) {
      setError('Failed to send instruction');
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold mb-3">Manage Collectors</h1>
          <p className="text-muted">Assign bins, send instructions, and monitor activity.</p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Form className="row g-3 align-items-end">
                <Form.Group className="col-md-4" controlId="assignCollector">
                  <Form.Label>Collector</Form.Label>
                  <Form.Select name="collectorId" value={assign.collectorId} onChange={(e)=>setAssign({...assign,collectorId:e.target.value})} autoComplete="section-assign collector">
                    <option value="">Select collector</option>
                    {collectors.map(c=> <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="col-md-6" controlId="assignBinIds">
                  <Form.Label>Bin IDs (comma separated)</Form.Label>
                  <Form.Control name="binIds" placeholder="BIN001, BIN002" value={assign.binIds} onChange={(e)=>setAssign({...assign,binIds:e.target.value})} autoComplete="section-assign bin-ids" />
                </Form.Group>
                <div className="col-md-2 text-md-end">
                  <Button variant="primary" disabled={!assign.collectorId || !assign.binIds || sending} onClick={assignBins}>
                    <i className="bi bi-link-45deg me-2"></i>Assign
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header><h5 className="mb-0">Collectors</h5></Card.Header>
            <Card.Body>
              {loading ? <div className="text-center"><Spinner animation="border" /></div> : error ? <Alert variant="danger">{error}</Alert> : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Assigned Bins</th>
                        <th>Last Login</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectors.map((c,idx)=> (
                        <tr key={idx}>
                          <td>{c.name}<br/><small className="text-muted">{c.email}</small></td>
                          <td><Badge bg="info">{c.assignedBins?.length || 0}</Badge></td>
                          <td><small className="text-muted">{c.lastLogin ? new Date(c.lastLogin).toLocaleString() : '—'}</small></td>
                          <td>
                            <Button size="sm" variant="outline-primary" onClick={()=>sendInstruction(c._id)}>
                              <i className="bi bi-send me-1"></i>Notify
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header><h5 className="mb-0">Recent Bins</h5></Card.Header>
            <Card.Body>
              {loading ? <div className="text-center"><Spinner animation="border" /></div> : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Bin</th>
                        <th>Waste</th>
                        <th>Fill</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bins.slice(0,8).map((b,idx)=> (
                        <tr key={idx}>
                          <td>{b.binId}</td>
                          <td>{b.wasteType}</td>
                          <td>{b.currentFillLevel || b.fillLevel}%</td>
                          <td>{b.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SupervisorCollectors;
