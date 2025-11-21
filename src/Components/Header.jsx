// src/Components/Header.jsx
import React, { useEffect, useState } from "react";
import { Navbar, Container, Nav, Button, Badge, Dropdown, Image } from "react-bootstrap";
import { FaShoppingCart, FaSignInAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/Header.modules.css";

// NOTE: use the same key that your ProductsPage / Cart use.
// Earlier code saved cart to localStorage under "cart" — keep that consistent.
const CART_KEY = "cart";

function readCartCount() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return 0;
    // count total items (sum of qty). If items don't have qty field, count them as 1.
    return arr.reduce((sum, it) => sum + (Number(it.qty) || 1), 0);
  } catch {
    return 0;
  }
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true" ||
      localStorage.getItem("adminLoggedIn") === "true"
  );

  const [count, setCount] = useState(() => readCartCount());

  useEffect(() => {
    setIsLoggedIn(
      localStorage.getItem("isLoggedIn") === "true" ||
        localStorage.getItem("adminLoggedIn") === "true"
    );
  }, [location.pathname]);

  useEffect(() => {
    const onCartUpdated = (e) => {
      const detail = e?.detail;
      if (Array.isArray(detail)) {
        // if event provides full cart array, compute qty sum
        const items = detail;
        const total = items.reduce((s, it) => s + (Number(it.qty) || 1), 0);
        setCount(total);
      } else {
        // fallback read directly from localStorage
        setCount(readCartCount());
      }
    };
    window.addEventListener("cart-updated", onCartUpdated);

    const onStorage = (ev) => {
      if (ev.key === CART_KEY) {
        try {
          const arr = ev.newValue ? JSON.parse(ev.newValue) : [];
          const total = Array.isArray(arr) ? arr.reduce((s, it) => s + (Number(it.qty) || 1), 0) : 0;
          setCount(total);
        } catch {
          setCount(0);
        }
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cart-updated", onCartUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Hide header on specific routes
  const hideHeaderRoutes = ["/login", "/admin-login"];
  if (hideHeaderRoutes.includes(location.pathname)) return null;

  const handleUserLogin = () => navigate("/login");
  const handleAdminLogin = () => navigate("/admin-login");

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleProductsClick = () =>
    isLoggedIn ? navigate("/products") : navigate("/login");

  const handleCartClick = () =>
    isLoggedIn ? navigate("/cart") : navigate("/login");

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="py-2 custom-navbar">
      <Container fluid className="navbar-container px-4">
        <Navbar.Brand
          onClick={() => navigate("/")}
          className="d-flex align-items-center brand-section"
          style={{ cursor: "pointer" }}
        >
          <img src="images/tastydelight_logo.jpg" alt="logo" width="55" height="45" className="me-2" />
          <span className="fw-bold brand-text">
            Tasty <span className="text-light">Delight</span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center nav-gap">
            <Nav.Link onClick={() => navigate("/")} className="nav-link-custom">
              Home
            </Nav.Link>

            <Nav.Link onClick={handleProductsClick} className="nav-link-custom">
              Products
            </Nav.Link>

            <Nav.Link onClick={handleCartClick} className="nav-link-custom d-flex align-items-center position-relative">
              <FaShoppingCart className="me-1" />
              <span className="ms-1">Cart</span>
              {count > 0 && (
                <Badge bg="danger" pill style={{ marginLeft: 8, position: "relative", top: -6 }}>
                  {count}
                </Badge>
              )}
            </Nav.Link>

            {!isLoggedIn ? (
              <div className="d-flex">
                <Button variant="primary" size="sm" onClick={handleUserLogin} className="ms-3">
                  <FaSignInAlt className="me-1" /> User Login
                </Button>

                <Button variant="warning" size="sm" onClick={handleAdminLogin} className="ms-3 text-white">
                  <FaSignInAlt className="me-1" /> Admin Login
                </Button>
              </div>
            ) : (
              <Dropdown align="end" className="ms-3">
                <Dropdown.Toggle as="div" className="avatar-dropdown" style={{ cursor: "pointer" }}>
                  <Image
                    src="/images/user.png"
                    roundedCircle
                    className="avatar-img"
                    width={36}
                    height={36}
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
