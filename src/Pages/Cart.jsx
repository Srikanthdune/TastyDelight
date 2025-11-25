// src/Pages/Cart.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Card, Button, Form, Image } from "react-bootstrap";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import "../Styles/Cart.modules.css";
import { applyCoupon as applyCouponHelper } from "../Admin/Pages/Coupons"; // <- uses exported helper

const CART_KEY = "cart";
const CART_COUPON_KEY = "cart_applied_coupon";
const ADMIN_COUPONS_KEY = "admin_coupons_v1";

/**
 * Ensure default coupons exist in localStorage. This writes a default list
 * only if the storage key is missing or unparseable.
 */
function ensureDefaultCoupons() {
  try {
    const raw = localStorage.getItem(ADMIN_COUPONS_KEY);
    if (raw) {
      // try to parse; if parse succeeds and is an array, do nothing
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return;
    }
  } catch (e) {
    // fall through to write defaults
  }

  const defaults = [
    {
      id: `cp_${Math.random().toString(36).slice(2, 9)}`,
      title: "Welcome Coupon",
      code: "WELCOME50",
      description: "Get flat 50 OFF on your first order!",
      discount: 50,
      type: "flat",
      minTotal: 0,
      active: true,
    },
    {
      id: `cp_${Math.random().toString(36).slice(2, 9)}`,
      title: "₹500+ Purchase Coupon",
      code: "SAVE500",
      description: "Save 75 when your order is above 500.",
      discount: 75,
      type: "flat",
      minTotal: 500,
      active: true,
    },
    {
      id: `cp_${Math.random().toString(36).slice(2, 9)}`,
      title: "10 OFF Demo",
      code: "TENOFF",
      description: "Demo flat 10 off.",
      discount: 10,
      type: "flat",
      minTotal: 0,
      active: true,
    },
  ];

  try {
    localStorage.setItem(ADMIN_COUPONS_KEY, JSON.stringify(defaults));
    // notify listeners
    window.dispatchEvent(new CustomEvent("coupons-updated", { detail: defaults }));
  } catch (e) {
    console.error("Failed to seed default coupons", e);
  }
}

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [coupons, setCoupons] = useState([
    { code: "NONE", label: "Select a coupon...", discount: 0, minTotal: 0 },
  ]);
  const [selectedCoupon, setSelectedCoupon] = useState("NONE");

  // appliedCoupon stored shape:
  // - previous code used { code, discount }
  // - with new helper we store { code, amount }
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_COUPON_KEY);
      return raw ? JSON.parse(raw) : { code: "NONE", amount: 0 };
    } catch {
      return { code: "NONE", amount: 0 };
    }
  });

  /* -------------------- LOAD CART (dedupe if necessary) -------------------- */
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const map = new Map();
      (raw || []).forEach((item) => {
        if (!item || !item.id) return;
        const existing = map.get(item.id);
        if (existing) {
          existing.qty = (existing.qty || 0) + (item.qty || 0);
        } else {
          map.set(item.id, {
            id: item.id,
            name: item.name || item.title || "",
            price: Number(item.price) || 0,
            image: item.image || item.img || "",
            qty: Number(item.qty) || 0,
          });
        }
      });
      const merged = Array.from(map.values());
      if ((raw ? raw.length : 0) !== merged.length) {
        localStorage.setItem(CART_KEY, JSON.stringify(merged));
      }
      setCart(merged);
    } catch {
      setCart([]);
    }
  }, []);

  const persistCart = (next) => {
    setCart(next);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: next }));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  };

  /* -------------------- LOAD ADMIN COUPONS (with seeding) -------------------- */
  useEffect(() => {
    // ensure defaults exist so cart and other pages always see something
    ensureDefaultCoupons();

    const loadCoupons = () => {
      try {
        const raw = localStorage.getItem(ADMIN_COUPONS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];

        const formatted = (parsed || []).map((c) => {
          const code = (c && (c.code || c.code === 0 ? String(c.code) : "")).toString().toUpperCase();
          return {
            code: code || "",
            label: c && c.title ? `${c.title} (${code})` : code || "",
            discount: Number((c && c.discount) || 0) || 0,
            minTotal: Number((c && c.minTotal) || c.minTotal || 0) || 0,
            type: (c && c.type) || "flat",
            active: typeof c.active === "boolean" ? c.active : true,
          };
        });

        const dedupe = {};
        formatted.forEach((f) => {
          if (f.code) dedupe[f.code] = f;
        });
        const unique = Object.values(dedupe);

        setCoupons([{ code: "NONE", label: "Select a coupon...", discount: 0 }, ...unique]);

        const rawApplied = localStorage.getItem(CART_COUPON_KEY);
        let applied = rawApplied ? JSON.parse(rawApplied) : { code: "NONE", amount: 0 };

        // legacy support: if stored applied had 'discount' field, convert to amount
        if (applied && applied.discount !== undefined && applied.amount === undefined) {
          applied = { code: applied.code || "NONE", amount: Number(applied.discount || 0) };
        }

        setAppliedCoupon(applied);
        setSelectedCoupon(applied?.code || "NONE");
      } catch (err) {
        console.error("Failed to load coupons", err);
        setCoupons([{ code: "NONE", label: "Select a coupon...", discount: 0 }]);
        setSelectedCoupon("NONE");
        setAppliedCoupon({ code: "NONE", amount: 0 });
      }
    };

    const onStorage = (e) => {
      if (!e) return;
      if (e.key === ADMIN_COUPONS_KEY || e.key === CART_COUPON_KEY) {
        loadCoupons();
      }
    };

    window.addEventListener("coupons-updated", loadCoupons);
    window.addEventListener("storage", onStorage);

    loadCoupons();

    return () => {
      window.removeEventListener("coupons-updated", loadCoupons);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  /* -------------------- HANDLE QTY + REMOVE -------------------- */
  const updateQty = (id, delta) => {
    const updated = cart.reduce((acc, item) => {
      if (item.id !== id) {
        acc.push(item);
        return acc;
      }
      const currentQty = Number(item.qty || 0);
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        return acc;
      }
      acc.push({ ...item, qty: newQty });
      return acc;
    }, []);
    persistCart(updated);
  };

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    persistCart(updated);
  };

  /* -------------------- PRICE CALCULATIONS -------------------- */
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0),
    [cart]
  );

  // derive discount & new total using applyCouponHelper for correctness
  const couponResult = useMemo(() => {
    if (!appliedCoupon || !appliedCoupon.code || appliedCoupon.code === "NONE") {
      return { success: false, amount: 0, newTotal: subtotal, message: "" };
    }
    try {
      // applyCouponHelper returns { success, amount, newTotal, message, coupon }
      return applyCouponHelper(appliedCoupon.code, subtotal);
    } catch (e) {
      console.error("coupon apply error", e);
      return { success: false, amount: appliedCoupon.amount || 0, newTotal: Math.max(0, subtotal - (appliedCoupon.amount || 0)), message: "" };
    }
  }, [appliedCoupon, subtotal]);

  const appliedDiscount = couponResult?.amount || 0;
  const total = couponResult?.newTotal ?? Math.max(0, subtotal - appliedDiscount);

  /* -------------------- APPLY / CLEAR COUPON -------------------- */
  const applyCoupon = () => {
    if (selectedCoupon === "NONE") {
      // Clear
      const cleared = { code: "NONE", amount: 0 };
      setAppliedCoupon(cleared);
      try {
        localStorage.setItem(CART_COUPON_KEY, JSON.stringify(cleared));
        window.dispatchEvent(new CustomEvent("coupons-updated", { detail: null }));
      } catch (e) {
        console.error("Failed to clear applied coupon", e);
      }
      alert("Coupon cleared!");
      return;
    }

    const found = coupons.find((c) => c.code === selectedCoupon);
    if (!found) {
      alert("Coupon not found or removed by admin.");
      setTimeout(() => window.dispatchEvent(new CustomEvent("coupons-updated", { detail: null })), 0);
      return;
    }

    if (found.minTotal && subtotal < found.minTotal) {
      alert(`Requires minimum subtotal &#8377;${found.minTotal}.`);
      return;
    }

    // Use the shared helper to compute correct amount
    const res = applyCouponHelper(found.code, subtotal);
    if (!res.success) {
      alert(res.message || "Failed to apply coupon.");
      return;
    }

    const applyObj = { code: found.code, amount: res.amount };
    setAppliedCoupon(applyObj);
    try {
      localStorage.setItem(CART_COUPON_KEY, JSON.stringify(applyObj));
      window.dispatchEvent(new CustomEvent("coupons-updated", { detail: null }));
    } catch (e) {
      console.error("Failed to save applied coupon", e);
    }
    alert(`${found.code} applied successfully! Discount: &#8377;${res.amount}`);
  };

  /* -------------------- CLEAR APPLIED COUPON IF ADMIN REMOVED IT -------------------- */
  useEffect(() => {
    if (!appliedCoupon || appliedCoupon.code === "NONE") return;

    const exists = coupons.find((c) => c.code === appliedCoupon.code);
    if (!exists) {
      const cleared = { code: "NONE", amount: 0 };
      setAppliedCoupon(cleared);
      try {
        localStorage.setItem(CART_COUPON_KEY, JSON.stringify(cleared));
        setSelectedCoupon("NONE");
        window.dispatchEvent(new CustomEvent("coupons-updated", { detail: null }));
      } catch (e) {
        console.error("Failed to clear removed coupon", e);
      }
      alert("Coupon removed by admin and cleared from your cart.");
    }
  }, [coupons, appliedCoupon]);

  /* -------------------- CLEAR COUPON IF CART EMPTY -------------------- */
  useEffect(() => {
    if (!cart || cart.length === 0) {
      const cleared = { code: "NONE", amount: 0 };
      setAppliedCoupon(cleared);
      try {
        localStorage.setItem(CART_COUPON_KEY, JSON.stringify(cleared));
        setSelectedCoupon("NONE");
      } catch (e) {
        console.error("Failed to clear coupon for empty cart", e);
      }
    }
  }, [cart]);

  /* -------------------- RENDER -------------------- */
  return (
    <>
      <Header />

      <div
        className="cart-background d-flex flex-column align-items-center"
        style={{ backgroundColor: "#fff", minHeight: "100vh", paddingTop: "100px" }}
      >
        <Container style={{ maxWidth: "1200px" }}>
          <Button
            variant="link"
            className="text-dark mb-3 d-flex align-items-center"
            onClick={() => navigate("/products")}
          >
            <FaArrowLeft className="me-2" /> Back to Menu
          </Button>

          <h2 className="fw-semibold mb-4">Your Shopping Cart</h2>

          <Row>
            {/* CART ITEMS */}
            <Col lg={8}>
              {(!cart || cart.length === 0) && (
                <Card className="p-4 text-center mb-4">
                  <h5>Your cart is empty.</h5>
                  <Button className="mt-3" onClick={() => navigate("/products")}>Go Shopping</Button>
                </Card>
              )}

              {cart.map((item) => (
                <Card className="p-3 mb-4" key={item.id}>
                  <Row className="align-items-center">
                    <Col md={3}>
                      <Image
                        src={item.image || "/images/placeholder-product.jpg"}
                        rounded
                        style={{ width: 140, height: 140, objectFit: "cover" }}
                      />
                    </Col>

                    <Col md={4}>
                      <h5>{item.name}</h5>
                      <p className="text-muted">&#8377;{item.price}</p>
                    </Col>

                    <Col md={3} className="d-flex align-items-center">
                      <Button size="sm" variant="outline-secondary" onClick={() => updateQty(item.id, -1)}>-</Button>
                      <div className="px-3">{item.qty}</div>
                      <Button size="sm" variant="outline-secondary" onClick={() => updateQty(item.id, +1)}>+</Button>
                    </Col>

                    <Col md={2} className="text-end">
                      <h6 className="fw-bold">&#8377;{(Number(item.price || 0) * Number(item.qty || 0)).toFixed(0)}</h6>
                      <Button size="sm" variant="danger" onClick={() => removeItem(item.id)}>
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Col>

            {/* ORDER SUMMARY + COUPON */}
            <Col lg={4}>
              <Card className="p-3 position-sticky" style={{ top: 20 }}>
                <h5 className="mb-3">Order Summary</h5>

                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>&#8377;{subtotal.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Discount</span>
                  <span>- &#8377;{(appliedDiscount || 0).toFixed(2)}</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold mb-3">
                  <span>Total</span>
                  <span>&#8377;{total.toFixed(2)}</span>
                </div>

                <Form.Select
                  className="mb-3"
                  value={selectedCoupon}
                  onChange={(e) => setSelectedCoupon(e.target.value)}
                >
                  {coupons.map((c) => (
                    <option key={c.code || Math.random()} value={c.code}>{c.label || c.code}</option>
                  ))}
                </Form.Select>

                <Button variant="secondary" className="w-100 mb-2" onClick={applyCoupon} disabled={cart.length === 0}>
                  {appliedCoupon?.code && appliedCoupon.code !== "NONE" && appliedCoupon.code === selectedCoupon ? "Clear / Reapply" : "Apply Coupon"}
                </Button>

                <Button
                  variant="primary"
                  className="w-100"
                  disabled={cart.length === 0}
                  onClick={() =>
                    navigate("/checkout", {
                      state: {
                        cart,
                        subtotal,
                        appliedCoupon,
                        total
                      }
                    })
                  }
                >
                  Checkout — Pay &#8377;{total.toFixed(2)}
                </Button>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
