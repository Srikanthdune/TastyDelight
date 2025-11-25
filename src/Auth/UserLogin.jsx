import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/UserLogin.modules.css";

function UserLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const expectedEmail = "digit@gmail.com";
    const expectedPassword = "1234";

    if (email === expectedEmail && password === expectedPassword) {
      localStorage.setItem("isLoggedIn", "true");
      setError("");
      navigate("/");
    } else {
      window.alert("User ID and password is incorrect.");
    }
  };

  return (
    <div className="login-page d-flex flex-column align-items-center justify-content-center vh-100">
      <div
        className="p-4 shadow rounded bg-white"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="text-center mb-2">
          <img src="images/tastydelight_logo.jpg" alt="logo" width="80" height="80" />
          <h4 className="fw-bold text-dark mb-1">Tasty Delight</h4>
        </div>

        <h5 className="text-center mb-3 text-primary fw-semibold">Welcome Back 👋</h5>
        <p className="text-center text-muted small mb-4">
          Login to your account to order now.
        </p>

        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="email"
              placeholder="Enter email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="formBasicPassword">
            <Form.Control
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Form.Group>

          {/* ⭐ Added credentials hint text */}
          <p className="text-center text-muted small mb-3">
            <strong>Email:</strong> digit@gmail.com <br />
            <strong>Password:</strong> 1234
          </p>

          <Button variant="primary" type="submit" className="w-100 mb-4">
            Login
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default UserLogin;
