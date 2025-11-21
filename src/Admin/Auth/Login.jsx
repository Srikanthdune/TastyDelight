import React from "react";
import { Button, Form, Row, Col, Container, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Styles/Login.modules.css";

function AdminLogin() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (email === "admin@gmail.com" && password === "admin123") {
      // Use a consistent key for protecting admin routes
      localStorage.setItem("adminToken", "demo-admin-token");
      // Navigate to the admin dashboard route (use replace to avoid back-button going to login)
      navigate("/Admin/dashboard", { replace: true });
    } else {
      alert("❌ Invalid Admin Email or Password");
    }
  };

  return (
    <div className="admin-login-page">
      <Row className="g-0 h-100">
        {/* Left Image Section */}
        <Col md={6} className="login-image-section">
          <div className="overlay"></div>
          <img src="/images/Tree.jpg" alt="Restaurant" className="login-image" />
          <div className="login-text">
            <h2 className="fw-bold text-white mb-2">Tasty Delight Admin</h2>
            <p className="text-white-50 mb-0">
              Manage your menu, orders & staff — all in one place.
            </p>
          </div>
        </Col>

        {/* Right Login Section */}
        <Col md={6} className="d-flex justify-content-center align-items-center bg-gradient">
          <Container style={{ maxWidth: "420px" }}>
            <Card className="login-card p-4 border-0 shadow-lg">
              <div className="text-center mb-3">
                <img src="/images/tastydelight_logo.jpg" alt="logo" width="70" height="70" className="mb-2" />
                <h3 className="fw-bold text-dark">Admin Login</h3>
                <p className="text-muted small">
                  Welcome back! Please enter your credentials.
                </p>
              </div>

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    className="custom-input"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    className="custom-input"
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" size="lg" type="submit" className="login-btn">
                    Login
                  </Button>
                </div>
              </Form>
            </Card>
          </Container>
        </Col>
      </Row>
    </div>
  );
}

export default AdminLogin;
