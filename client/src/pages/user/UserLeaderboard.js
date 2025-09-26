import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardType, setLeaderboardType] = useState('waste');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/user/leaderboard?type=${leaderboardType}`);
      setLeaderboardData(response.data.data);
    } catch (error) {
      setError('Failed to load leaderboard');
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [leaderboardType]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'bg-warning text-dark';
    if (rank === 2) return 'bg-secondary text-white';
    if (rank === 3) return 'bg-warning text-dark';
    return 'bg-light text-dark';
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading leaderboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <Button variant="outline-danger" size="sm" className="ms-3" onClick={fetchLeaderboard}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  const { leaderboard, currentUserRank, type } = leaderboardData || {};

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold">Leaderboard</h1>
          <p className="text-muted">See how you rank against other users</p>
        </Col>
      </Row>

      {/* Type Selector */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-center gap-3">
                <Button
                  variant={leaderboardType === 'waste' ? 'primary' : 'outline-primary'}
                  onClick={() => setLeaderboardType('waste')}
                >
                  <i className="bi bi-trash me-2"></i>
                  By Waste Amount
                </Button>
                <Button
                  variant={leaderboardType === 'efficiency' ? 'primary' : 'outline-primary'}
                  onClick={() => setLeaderboardType('efficiency')}
                >
                  <i className="bi bi-bullseye me-2"></i>
                  By Efficiency
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Current User Rank */}
      {currentUserRank && (
        <Row className="mb-4">
          <Col>
            <Card className="border-primary">
              <Card.Body className="bg-primary text-white">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <h2 className="mb-0">{getRankIcon(currentUserRank)}</h2>
                  </div>
                  <div>
                    <h5 className="mb-1">Your Rank</h5>
                    <p className="mb-0">
                      You are ranked #{currentUserRank} in {type === 'waste' ? 'waste amount' : 'efficiency'}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Leaderboard */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Top {leaderboard?.length || 0} Users - {type === 'waste' ? 'Waste Amount' : 'Efficiency'}
              </h5>
            </Card.Header>
            <Card.Body>
              {leaderboard && leaderboard.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th width="80">Rank</th>
                        <th>User</th>
                        <th>Waste Amount</th>
                        <th>Efficiency</th>
                        <th>Monthly Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((user, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`badge ${getRankClass(user.rank)} fs-6`}>
                              {getRankIcon(user.rank)}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="rounded-circle"
                                    width="40"
                                    height="40"
                                  />
                                ) : (
                                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                                       style={{ width: '40px', height: '40px' }}>
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="fw-semibold">{user.name}</div>
                                <small className="text-muted">User</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="fw-semibold">{user.totalWasteAmount.toFixed(0)} items</span>
                          </td>
                          <td>
                            <span className={`badge ${user.segregationEfficiency >= 90 ? 'bg-success' : user.segregationEfficiency >= 70 ? 'bg-warning' : 'bg-danger'}`}>
                              {user.segregationEfficiency.toFixed(1)}%
                            </span>
                          </td>
                          <td>
                            <span className="text-primary fw-semibold">{user.monthlyPoints}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-trophy display-4 text-muted"></i>
                  <p className="text-muted mt-3">No leaderboard data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserLeaderboard;
