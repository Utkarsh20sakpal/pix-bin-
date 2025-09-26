import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Table, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    wasteType: '',
    startDate: '',
    endDate: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`/api/user/history?${params}`);
      setRecords(response.data.data.records);
      setPagination(response.data.data.pagination);
    } catch (error) {
      setError('Failed to load history');
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1
    });
  };

  const clearFilters = () => {
    setFilters({
      wasteType: '',
      startDate: '',
      endDate: '',
      page: 1
    });
  };

  const wasteTypes = ['organic', 'plastic', 'paper', 'metal', 'glass', 'electronic'];

  if (loading && records.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading history...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold">Waste History</h1>
          <p className="text-muted">Track all your waste segregation records</p>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group controlId="historyWasteType">
                <Form.Label>Waste Type</Form.Label>
                <Form.Select
                  name="wasteType"
                  value={filters.wasteType}
                  onChange={handleFilterChange}
                  autoComplete="section-history waste-type"
                >
                  <option value="">All Types</option>
                  {wasteTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="historyStartDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  autoComplete="section-history start-date"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="historyEndDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  autoComplete="section-history end-date"
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Records Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Waste Records</h5>
        </Card.Header>
        <Card.Body>
          {error ? (
            <Alert variant="danger">{error}</Alert>
          ) : records.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Waste Type</th>
                      <th>Amount</th>
                      <th>Accuracy</th>
                      <th>Points</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={index}>
                        <td>{new Date(record.timestamp).toLocaleString()}</td>
                        <td>
                          <span className={`waste-type-badge waste-type-${record.wasteType}`}>
                            {record.wasteType}
                          </span>
                        </td>
                        <td>{record.amount} {record.unit}</td>
                        <td>
                          <span className={`badge ${record.accuracy >= 90 ? 'bg-success' : record.accuracy >= 70 ? 'bg-warning' : 'bg-danger'}`}>
                            {record.accuracy.toFixed(1)}%
                          </span>
                        </td>
                        <td>{record.points}</td>
                        <td>
                          <span className={`badge ${record.collectionStatus === 'collected' ? 'bg-success' : 'bg-warning'}`}>
                            {record.collectionStatus || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.total)} of {pagination.total} records
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={pagination.current === 1}
                      onClick={() => setFilters({...filters, page: pagination.current - 1})}
                    >
                      Previous
                    </Button>
                    <span className="mx-3">
                      Page {pagination.current} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={pagination.current === pagination.pages}
                      onClick={() => setFilters({...filters, page: pagination.current + 1})}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-4 text-muted"></i>
              <p className="text-muted mt-3">No records found</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserHistory;
