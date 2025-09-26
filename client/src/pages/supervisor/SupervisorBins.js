import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const SupervisorBins = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', wasteType: '', fillLevel: '' });
  const [updating, setUpdating] = useState(false);

  const fetchBins = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/supervisor/bins', { params: filters });
      setBins(res.data.data || []);
    } catch (e) {
      setError('Failed to load bins');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBins(); }, []);

  const updateStatus = async (binId, status) => {
    try {
      setUpdating(true);
      await axios.put(`/api/supervisor/bins/${binId}/status`, { status, description: `Status set to ${status}` });
      await fetchBins();
    } catch (e) {
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold mb-3">Bin Management</h1>
          <p className="text-muted">Monitor, filter and update bin statuses.</p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Form className="row g-3 align-items-end">
                <Form.Group className="col-md-3" controlId="filterStatus">
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={filters.status} onChange={(e)=>setFilters({...filters,status:e.target.value})} autoComplete="section-filters status">
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="full">Full</option>
                    <option value="damaged">Damaged</option>
                    <option value="offline">Offline</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="col-md-3" controlId="filterWasteType">
                  <Form.Label>Waste Type</Form.Label>
                  <Form.Select value={filters.wasteType} onChange={(e)=>setFilters({...filters,wasteType:e.target.value})} autoComplete="section-filters waste-type">
                    <option value="">All</option>
                    <option value="organic">Organic</option>
                    <option value="plastic">Plastic</option>
                    <option value="paper">Paper</option>
                    <option value="metal">Metal</option>
                    <option value="glass">Glass</option>
                    <option value="electronic">Electronic</option>
                    <option value="mixed">Mixed</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="col-md-3" controlId="filterFillLevel">
                  <Form.Label>Fill Level</Form.Label>
                  <Form.Select value={filters.fillLevel} onChange={(e)=>setFilters({...filters,fillLevel:e.target.value})} autoComplete="section-filters fill-level">
                    <option value="">All</option>
                    <option value="1">Below 25%</option>
                    <option value="2">25-49%</option>
                    <option value="3">50-74%</option>
                    <option value="4">75-89%</option>
                    <option value="5">90%+</option>
                  </Form.Select>
                </Form.Group>
                <div className="col-md-3 text-md-end">
                  <Button variant="primary" className="me-2" onClick={fetchBins}><i className="bi bi-funnel me-2"></i>Apply</Button>
                  <Button variant="outline-secondary" onClick={()=>{setFilters({status:'',wasteType:'',fillLevel:''}); fetchBins();}}>Reset</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Bins</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : bins.length === 0 ? (
                <div className="text-center py-4 text-muted">No bins match the filters.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Bin ID</th>
                        <th>Waste Type</th>
                        <th>Fill</th>
                        <th>Status</th>
                        <th>Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bins.map((b,idx)=> (
                        <tr key={idx}>
                          <td>{b.binId}</td>
                          <td><span className={`waste-type-badge waste-type-${b.wasteType}`}>{b.wasteType}</span></td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress me-2" style={{ width: '80px', height: '8px' }}>
                                <div className={`progress-bar ${b.fillLevel>=90?'bg-danger':b.fillLevel>=75?'bg-warning':'bg-success'}`} style={{ width: `${b.fillLevel}%` }}></div>
                              </div>
                              <small>{b.fillLevel.toFixed(0)}%</small>
                            </div>
                          </td>
                          <td>
                            <Badge bg={b.status==='active'?'success':b.status==='full'?'danger':b.status==='maintenance'?'warning':b.status==='offline'?'secondary':'info'}>
                              {b.status}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">{b.location?.address || '—'}</small>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button size="sm" variant="outline-success" disabled={updating} onClick={()=>updateStatus(b.binId,'active')}>Active</Button>
                              <Button size="sm" variant="outline-warning" disabled={updating} onClick={()=>updateStatus(b.binId,'maintenance')}>Maint.</Button>
                              <Button size="sm" variant="outline-danger" disabled={updating} onClick={()=>updateStatus(b.binId,'damaged')}>Damaged</Button>
                            </div>
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
      </Row>
    </Container>
  );
};

export default SupervisorBins;
