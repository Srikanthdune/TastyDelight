import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button
} from "react-bootstrap";
import { FaMapMarkerAlt, FaUser, FaPhone, FaHome, FaCheck } from "react-icons/fa";
import Header from "../Components/Header";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Load cart from route or localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      return (
        location?.state?.cart ||
        JSON.parse(localStorage.getItem("cart") || "[]")
      );
    } catch (e) {
      return [];
    }
  });

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    street: "",
    city: "",
    zip: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function subtotal() {
    return cartItems.reduce(
      (s, it) => s + (it.price || 0) * (it.qty || 1),
      0
    );
  }

  function handlePlaceOrder() {
    if (!form.fullName.trim() || !form.mobile.trim() || !form.street.trim()) {
      alert("Please fill Full Name, Mobile Number, and Street.");
      return;
    }

    const order = {
      customer: { ...form },
      items: cartItems,
      subtotal: subtotal(),
      paymentMethod: "Cash on Delivery (COD)",
      createdAt: new Date().toISOString(),
    };

    // Clear cart
    localStorage.removeItem("cart");

    // Save order data for success UI
    setOrderData(order);

    // Show success UI
    setOrderPlaced(true);
  }

  return (
    <>
      <Header />

      <Container style={{ marginTop: 110, marginBottom: 40 }}>
        {!orderPlaced && (
          <>
            <h1 className="mb-4">Checkout</h1>
            <Row>
              <Col md={8}>
                <Card className="p-3">
                  <Card.Body>
                    <Card.Title>
                      <FaMapMarkerAlt /> <span className="ms-2">Delivery Address</span>
                    </Card.Title>

                    <Form className="mt-3">
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Label>
                            <FaUser className="me-2" /> Full Name
                          </Form.Label>
                          <Form.Control
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                          />
                        </Col>

                        <Col md={6} className="mb-3">
                          <Form.Label>
                            <FaPhone className="me-2" /> Mobile Number
                          </Form.Label>
                          <Form.Control
                            name="mobile"
                            value={form.mobile}
                            onChange={handleChange}
                          />
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaHome className="me-2" /> Street Address
                        </Form.Label>
                        <Form.Control
                          name="street"
                          value={form.street}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                          />
                        </Col>

                        <Col md={6} className="mb-3">
                          <Form.Label>Zip Code</Form.Label>
                          <Form.Control
                            name="zip"
                            value={form.zip}
                            onChange={handleChange}
                          />
                        </Col>
                      </Row>

                      <h4 className="mt-4">Payment Method</h4>
                      <Card className="p-3 bg-light mb-3">
                        <div>
                          Only <strong>Cash on Delivery (COD)</strong> is available.
                        </div>
                      </Card>

                      <Button
                        className="w-100"
                        variant="success"
                        onClick={handlePlaceOrder}
                      >
                        Place Order (Pay ₹{subtotal().toFixed(2)} on Delivery)
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="p-3">
                  <Card.Body>
                    <Card.Title>Order Summary</Card.Title>
                    <hr />

                    {cartItems.map((it, idx) => (
                      <div
                        key={idx}
                        className="d-flex justify-content-between py-2 border-bottom"
                      >
                        <div>
                          {it.name}{" "}
                          <small className="text-muted">x {it.qty}</small>
                        </div>
                        <div>₹{(it.price * it.qty).toFixed(0)}</div>
                      </div>
                    ))}

                    <div className="d-flex justify-content-between mt-3 pb-2 border-bottom">
                      <strong>Subtotal</strong>
                      <div>₹{subtotal().toFixed(2)}</div>
                    </div>

                    <div className="d-flex justify-content-between mt-3">
                      <h5>Total Payable</h5>
                      <h5>₹{subtotal().toFixed(2)}</h5>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* SUCCESS UI */}
        {orderPlaced && (
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "50px 30px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              {/* Green check */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#1e7e34",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  marginTop: -60,
                }}
              >
                <FaCheck style={{ color: "#fff", fontSize: 35 }} />
              </div>

              <div
                style={{
                  background: "#d9efe6",
                  padding: "25px",
                  borderRadius: "8px",
                  marginTop: "20px",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <h2 style={{ fontWeight: "bold", color: "#0f5132" }}>
                  Order Placed Successfully!
                </h2>

                <p style={{ marginTop: 10, color: "#0f5132" }}>
                  Thank you for your order. Your delicious food is being prepared
                  and will be delivered soon.
                </p>

                <p style={{ color: "#0f5132", marginBottom: 5 }}>
                  Payment Method:{" "}
                  <strong>{orderData?.paymentMethod}</strong>
                </p>

                <hr style={{ color: "#0f5132" }} />
              </div>

              <Button
                variant="primary"
                style={{ marginTop: 25, padding: "10px 30px" }}
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
