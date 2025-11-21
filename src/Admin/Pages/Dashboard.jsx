// src/Admin/Pages/Dashboard.jsx
import React, { useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../Components/AdminLayout";
import "../../Styles/Dashboard.modules.css";

function DashboardContent() {
  const navigate = useNavigate();

  const stats = [
    { title: "Total Products", value: 120, color: "text-primary", route: "/Admin/products" },
    { title: "Orders", value: 85, color: "text-success", route: "/Admin/orders" },
    { title: "Users", value: 50, color: "text-warning", route: "/Admin/users" },
    { title: "Categories", value: 10, color: "text-danger", route: "/Admin/categories" }
  ];

  // Dummy orders (replace with API data as needed)
  const orders = [
    { id: "ORD125", customer: "Vikram", total: 920, status: "Delivered", date: "Today 10:30 AM" },
    { id: "ORD124", customer: "Meera", total: 420, status: "Shipped", date: "Today 08:10 AM" },
    { id: "ORD123", customer: "Rahul", total: 650, status: "Pending", date: "Yesterday 06:00 PM" },
    { id: "ORD122", customer: "Sara", total: 300, status: "Delivered", date: "Yesterday 03:20 PM" },
    { id: "ORD121", customer: "Amit", total: 540, status: "Cancelled", date: "2 days ago" },
  ];

  // Determine first order today (simple approach: first item with 'Today' in date)
  const firstToday = orders.find((o) => o.date.toLowerCase().includes("today")) || null;

  // Logout function (keeps behavior consistent with AdminLayout's logout too)
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    sessionStorage.clear();
    navigate("/Admin/auth/login", { replace: true });
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Dashboard</h2>
        <div>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <Row className="g-4">
        {stats.map((item, index) => (
          <Col md={3} key={index}>
            <div
              style={{ cursor: item.route ? "pointer" : "default" }}
              onClick={() => item.route && navigate(item.route)}
            >
              <Card className="shadow-sm admin-card">
                <Card.Body>
                  <h5 className="card-title">{item.title}</h5>
                  <h2 className={`fw-bold ${item.color}`}>{item.value}</h2>
                </Card.Body>
              </Card>
            </div>
          </Col>
        ))}

        {/* Latest 5 Orders */}
        <Col xs={12} className="mt-4">
          <h4 className="fw-bold mb-3">Latest 5 Orders</h4>

          <Card className="shadow-sm">
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#ID</th>
                      <th>Customer</th>
                      <th>Total (₹)</th>
                      <th>Status</th>
                      <th>Ordered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.customer}</td>
                        <td>₹{o.total}</td>
                        <td>
                          <span className={`badge 
                            ${o.status === "Delivered" ? "bg-success" : 
                              o.status === "Pending" ? "bg-warning" : 
                              o.status === "Cancelled" ? "bg-danger" : 
                              "bg-primary"}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* First Order Today */}
        <Col xs={12} md={6} className="mt-4">
          <h4 className="fw-bold mb-3">First Order Today</h4>

          {firstToday ? (
            <Card className="shadow-sm p-3">
              <h5 className="mb-1">Order ID: {firstToday.id}</h5>
              <p className="mb-1"><strong>Customer:</strong> {firstToday.customer}</p>
              <p className="mb-1"><strong>Total:</strong> ₹{firstToday.total}</p>
              <p className="mb-1"><strong>Status:</strong> {firstToday.status}</p>
              <p className="mb-0"><strong>Time:</strong> {firstToday.date}</p>
            </Card>
          ) : (
            <Card className="shadow-sm p-3">
              <p className="mb-0">No orders found for today.</p>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  // Guard: if adminToken not present, redirect to login
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/Admin/auth/login", { replace: true });
    }
  }, [navigate]);

  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}
