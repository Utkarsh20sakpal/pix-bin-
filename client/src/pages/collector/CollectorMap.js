import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal } from 'react-bootstrap';

const CollectorMap = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBin, setSelectedBin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Simulate loading bin data
    setTimeout(() => {
      setBins([
        {
          id: 'BIN001',
          location: 'Central Park',
          fillLevel: 85,
          wasteType: 'organic',
          lastUpdated: '2024-01-15T10:30:00Z',
          coordinates: { lat: 28.6139, lng: 77.2090 },
          address: 'Central Park, New Delhi, India'
        },
        {
          id: 'BIN002',
          location: 'Shopping Mall',
          fillLevel: 45,
          wasteType: 'plastic',
          lastUpdated: '2024-01-15T09:15:00Z',
          coordinates: { lat: 28.6149, lng: 77.2100 },
          address: 'Select City Walk, Saket, New Delhi'
        },
        {
          id: 'BIN003',
          location: 'Residential Area',
          fillLevel: 92,
          wasteType: 'paper',
          lastUpdated: '2024-01-15T08:45:00Z',
          coordinates: { lat: 28.6129, lng: 77.2080 },
          address: 'Lajpat Nagar, New Delhi'
        },
        {
          id: 'BIN004',
          location: 'Office Complex',
          fillLevel: 30,
          wasteType: 'electronic',
          lastUpdated: '2024-01-15T11:00:00Z',
          coordinates: { lat: 28.6159, lng: 77.2110 },
          address: 'Cyber City, Gurgaon'
        },
        {
          id: 'BIN005',
          location: 'University Campus',
          fillLevel: 70,
          wasteType: 'glass',
          lastUpdated: '2024-01-15T09:30:00Z',
          coordinates: { lat: 28.6119, lng: 77.2070 },
          address: 'JNU Campus, New Delhi'
        }
      ]);
      setLoading(false);
    }, 1000);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  const getFillLevelColor = (level) => {
    if (level >= 80) return 'danger';
    if (level >= 60) return 'warning';
    return 'success';
  };

  const getWasteTypeIcon = (type) => {
    const icons = {
      organic: '🌱',
      plastic: '♻️',
      paper: '📄',
      metal: '🔧',
      glass: '🍶',
      electronic: '💻'
    };
    return icons[type] || '🗑️';
  };

  const handleBinClick = (bin) => {
    setSelectedBin(bin);
    setShowModal(true);
  };

  const handleCollection = async (binId) => {
    // Simulate collection process
    setBins(prev => prev.map(bin => 
      bin.id === binId 
        ? { ...bin, fillLevel: 0, lastUpdated: new Date().toISOString() }
        : bin
    ));
    setShowModal(false);
    setSelectedBin(null);
  };

  const getOptimizedRoute = () => {
    // Simple route optimization based on fill level and distance
    return bins
      .filter(bin => bin.fillLevel >= 60)
      .sort((a, b) => b.fillLevel - a.fillLevel);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading collection map...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold text-gradient">
            <i className="bi bi-geo-alt me-2"></i>
            Interactive Collection Map
          </h1>
          <p className="text-muted">Real-time bin monitoring and optimized collection routes</p>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="h-100 shadow-medium">
            <Card.Header className="gradient-bg text-white">
              <h5 className="mb-0">
                <i className="bi bi-map me-2"></i>
                Collection Map
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Interactive Map using OpenStreetMap */}
              <div style={{ height: '500px', position: 'relative' }}>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng-0.01},${mapCenter.lat-0.01},${mapCenter.lng+0.01},${mapCenter.lat+0.01}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', borderRadius: '0 0 0.75rem 0.75rem' }}
                  title="Collection Map"
                ></iframe>
                
                {/* Map Overlay with bin markers */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}>
                  <Card className="shadow-soft">
                    <Card.Body className="p-2">
                      <h6 className="mb-2">Bin Locations</h6>
                      {bins.slice(0, 3).map((bin) => (
                        <div key={bin.id} className="d-flex align-items-center mb-1">
                          <Badge 
                            bg={getFillLevelColor(bin.fillLevel)} 
                            className="me-2"
                            style={{ width: '12px', height: '12px', borderRadius: '50%' }}
                          ></Badge>
                          <small>{bin.id} - {bin.fillLevel}%</small>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </div>

                {/* User location indicator */}
                {userLocation && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
                    <Badge bg="info" className="p-2">
                      <i className="bi bi-geo-alt-fill me-1"></i>
                      Your Location
                    </Badge>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="h-100 shadow-medium">
            <Card.Header className="gradient-bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Collection Status
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Total Bins: {bins.length}</span>
                <Badge bg="primary">Active</Badge>
              </div>
              
              <div className="mb-3">
                <small className="text-muted">High Priority (≥80%)</small>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-danger" 
                    style={{ width: `${(bins.filter(b => b.fillLevel >= 80).length / bins.length) * 100}%` }}
                  ></div>
                </div>
                <span className="badge bg-danger">
                  {bins.filter(b => b.fillLevel >= 80).length} bins
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted">Medium Priority (60-79%)</small>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    style={{ width: `${(bins.filter(b => b.fillLevel >= 60 && b.fillLevel < 80).length / bins.length) * 100}%` }}
                  ></div>
                </div>
                <span className="badge bg-warning">
                  {bins.filter(b => b.fillLevel >= 60 && b.fillLevel < 80).length} bins
                </span>
              </div>

              <div className="mb-4">
                <small className="text-muted">Low Priority (&lt;60%)</small>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${(bins.filter(b => b.fillLevel < 60).length / bins.length) * 100}%` }}
                  ></div>
                </div>
                <span className="badge bg-success">
                  {bins.filter(b => b.fillLevel < 60).length} bins
                </span>
              </div>

              <Button 
                variant="primary" 
                className="w-100 mb-3"
                onClick={() => {
                  const route = getOptimizedRoute();
                  console.log('Optimized route:', route);
                }}
              >
                <i className="bi bi-route me-2"></i>
                Generate Route
              </Button>

              <Alert variant="info" className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Route Optimization:</strong> The system automatically suggests the most efficient collection route based on bin fill levels and locations.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="shadow-medium">
            <Card.Header className="gradient-bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-geo-alt-fill me-2"></i>
                Bin Locations & Status
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="row">
                {bins.map((bin) => (
                  <div key={bin.id} className="col-md-4 mb-3">
                    <Card 
                      className={`h-100 card-hover ${selectedBin?.id === bin.id ? 'border-primary shadow-medium' : ''}`}
                      onClick={() => handleBinClick(bin)}
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">{bin.id}</h6>
                          <Badge bg={getFillLevelColor(bin.fillLevel)}>
                            {bin.fillLevel}%
                          </Badge>
                        </div>
                        <p className="text-muted small mb-2">{bin.location}</p>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="text-muted">
                            {getWasteTypeIcon(bin.wasteType)} {bin.wasteType}
                          </span>
                          <small className="text-muted">
                            {new Date(bin.lastUpdated).toLocaleTimeString()}
                          </small>
                        </div>
                        <div className="progress mt-2" style={{ height: '4px' }}>
                          <div 
                            className={`progress-bar bg-${getFillLevelColor(bin.fillLevel)}`}
                            style={{ width: `${bin.fillLevel}%` }}
                          ></div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bin Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-geo-alt me-2"></i>
            Bin Details - {selectedBin?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBin && (
            <div>
              <Row className="mb-3">
                <Col sm={6}>
                  <strong>Location:</strong><br />
                  <span className="text-muted">{selectedBin.location}</span>
                </Col>
                <Col sm={6}>
                  <strong>Fill Level:</strong><br />
                  <Badge bg={getFillLevelColor(selectedBin.fillLevel)}>
                    {selectedBin.fillLevel}%
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={6}>
                  <strong>Waste Type:</strong><br />
                  <span className="text-muted">
                    {getWasteTypeIcon(selectedBin.wasteType)} {selectedBin.wasteType}
                  </span>
                </Col>
                <Col sm={6}>
                  <strong>Last Updated:</strong><br />
                  <span className="text-muted">
                    {new Date(selectedBin.lastUpdated).toLocaleString()}
                  </span>
                </Col>
              </Row>
              <div className="mb-3">
                <strong>Address:</strong><br />
                <span className="text-muted">{selectedBin.address}</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar bg-${getFillLevelColor(selectedBin.fillLevel)}`}
                  style={{ width: `${selectedBin.fillLevel}%` }}
                ></div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleCollection(selectedBin?.id)}
            disabled={selectedBin?.fillLevel < 60}
          >
            <i className="bi bi-check-circle me-2"></i>
            Mark as Collected
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CollectorMap;