// src/Admin/Components/AdminLayout.jsx
import React from "react";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/**
 * Minimal Admin layout with built-in top bar and sidebar.
 * No external Header/Slidbar/Footer needed.
 */
export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/Admin/auth/login", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* TOP BAR */}
      <div
        style={{
          background: "#0d6efd",
          color: "white",
          padding: "12px 20px",
          fontSize: "20px",
          fontWeight: "600",
        }}
      >
        Admin Panel
      </div>

      <Row className="g-0">
        {/* SIDEBAR */}
        <Col
          md={2}
          style={{
            background: "#f7f7f8",
            height: "calc(100vh - 56px)",
            padding: "20px",
            borderRight: "1px solid #e6e6e6",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li
              style={{ padding: "10px 6px", cursor: "pointer" }}
              onClick={() => navigate("/Admin/dashboard")}
            >
              Dashboard
            </li>
            <li
              style={{ padding: "10px 6px", cursor: "pointer" }}
              onClick={() => navigate("/Admin/products")}
            >
              Products
            </li>
            <li
              style={{ padding: "10px 6px", cursor: "pointer" }}
              onClick={() => navigate("/Admin/categories")}
            >
              Categories
            </li>
            <li
              style={{ padding: "10px 6px", cursor: "pointer" }}
              onClick={() => navigate("/Admin/coupons")}
            >
              Coupons
            </li>

            <li style={{ height: 14 }} />

            <li
              style={{
                padding: "10px 6px",
                cursor: "pointer",
                color: "red",
                fontWeight: "600",
                marginTop: 18,
              }}
              onClick={logout}
            >
              Logout
            </li>
          </ul>
        </Col>

        {/* MAIN */}
        <Col md={10} style={{ padding: 20 }}>{children}</Col>
      </Row>
    </div>
  );
}
