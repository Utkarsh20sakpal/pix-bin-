import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    return `/${user.userType}/dashboard`;
  };

  const getUserMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { label: 'Profile', path: '/profile' }
    ];

    switch (user.userType) {
      case 'user':
        return [
          ...baseItems,
          { label: 'History', path: '/user/history' },
          { label: 'Leaderboard', path: '/user/leaderboard' },
          { label: 'Feedback', path: '/user/feedback' }
        ];
      case 'supervisor':
        return [
          ...baseItems,
          { label: 'Collectors', path: '/supervisor/collectors' },
          { label: 'Bins', path: '/supervisor/bins' },
          { label: 'Feedback', path: '/supervisor/feedback' }
        ];
      case 'collector':
        return [
          ...baseItems,
          { label: 'Map', path: '/collector/map' },
          { label: 'History', path: '/collector/history' }
        ];
      default:
        return baseItems;
    }
  };

  return (
    <BootstrapNavbar 
      bg={theme === 'dark' ? 'dark' : 'light'} 
      variant={theme === 'dark' ? 'dark' : 'light'}
      expand="lg" 
      className="navbar-glass shadow-soft"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold text-primary">
          <i className="bi bi-recycle me-2"></i>
          IoT Waste Segregator
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={handleNavClick}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/customer-care" onClick={handleNavClick}>
              Customer Care
            </Nav.Link>
          </Nav>

          <Nav className="ms-auto">
            {/* Theme Toggle */}
            <Button
              variant={theme === 'light' ? 'outline-dark' : 'outline-light'}
              size="sm"
              onClick={toggleTheme}
              className="me-2 d-flex align-items-center px-3 py-1 rounded-pill"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              style={{
                background: theme === 'light' ? 'linear-gradient(135deg, #ffffff 0%, #f1f3f5 100%)' : 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <i className={`bi bi-${theme === 'light' ? 'moon-stars' : 'sun-fill'}`}></i>
              <span className="ms-2 fw-semibold" style={{ fontSize: '0.85rem' }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </Button>

            {isAuthenticated ? (
              <>
                {/* Dashboard Link */}
                <Nav.Link as={Link} to={getDashboardPath()} onClick={handleNavClick}>
                  Dashboard
                </Nav.Link>

                {/* User Menu */}
                <NavDropdown
                  title={
                    <span>
                      <i className="bi bi-person-circle me-1"></i>
                      {user?.name || 'User'}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                  menuVariant={theme === 'dark' ? 'dark' : 'light'}
                  renderMenuOnMount
                >
                  <NavDropdown.Header>
                    <small className="text-muted">
                      {user?.userType?.charAt(0).toUpperCase() + user?.userType?.slice(1)}
                    </small>
                  </NavDropdown.Header>
                  <NavDropdown.Divider />
                  
                  {getUserMenuItems().map((item, index) => (
                    <NavDropdown.Item
                      key={index}
                      as={Link}
                      to={item.path}
                      onClick={handleNavClick}
                    >
                      {item.label}
                    </NavDropdown.Item>
                  ))}
                  
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" onClick={handleNavClick}>
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" onClick={handleNavClick}>
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
