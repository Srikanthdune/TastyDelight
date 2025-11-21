// src/Admin/Pages/Coupons.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../Components/AdminLayout";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../Styles/Coupons.modules.css";

const LS_KEY = "admin_coupons_v1";

function uid(prefix = "cp") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// helper to persist and broadcast
function persistCouponsToStorage(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("coupons-updated", { detail: list }));
  } catch (e) {
    console.error("Failed to persist coupons", e);
  }
}

export default function CouponsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/Admin/auth/login", { replace: true });
    }
  }, [navigate]);

  // Build defaults and ensure they are persisted immediately if none exist
  const initialCoupons = (() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse existing coupons", e);
    }
    const defaults = [
      {
        id: uid(),
        title: "Welcome Coupon",
        code: "WELCOME50",
        description: "Get flat ₹50 OFF on your first order!",
        discount: 50,
        minTotal: 0,
      },
      {
        id: uid(),
        title: "₹500+ Purchase Coupon",
        code: "SAVE500",
        description: "Save ₹75 when your order is above ₹500.",
        discount: 75,
        minTotal: 500,
      },
      {
        id: uid(),
        title: "10% OFF (fixed demo)",
        code: "TENOFF",
        description: "Demo 10% (treated as fixed ₹10 in this UI).",
        discount: 10,
        minTotal: 0,
      },
    ];
    // persist defaults immediately so other pages can read them on next mount
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(defaults));
    } catch (e) {
      console.error("Failed to write default coupons", e);
    }
    return defaults;
  })();

  const [coupons, setCoupons] = useState(initialCoupons);

  // keep storage in sync whenever coupons state changes (defensive)
  useEffect(() => {
    persistCouponsToStorage(coupons);
  }, [coupons]);

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({ title: "", code: "", description: "", discount: 0, minTotal: 0 });

  const openForm = (index = null) => {
    setEditIndex(index);
    if (index !== null) {
      setFormData({
        title: coupons[index].title || "",
        code: coupons[index].code || "",
        description: coupons[index].description || "",
        discount: Number(coupons[index].discount) || 0,
        minTotal: Number(coupons[index].minTotal) || 0,
      });
    } else {
      setFormData({ title: "", code: "", description: "", discount: 0, minTotal: 0 });
    }
    setShowModal(true);
  };

  const saveCoupon = () => {
    if (!formData.code || !formData.title) {
      alert("Please enter coupon title and code.");
      return;
    }

    const normalized = {
      id: editIndex !== null ? coupons[editIndex].id : uid(),
      title: formData.title,
      code: formData.code.toUpperCase().trim(),
      description: formData.description,
      discount: Number(formData.discount) || 0,
      minTotal: Number(formData.minTotal) || 0,
    };

    setCoupons((current) => {
      const updated = editIndex !== null
        ? current.map((c, i) => (i === editIndex ? { ...normalized } : c))
        : [...current, normalized];

      // persist & broadcast immediately (redundant with effect but explicit)
      persistCouponsToStorage(updated);
      return updated;
    });

    setShowModal(false);
  };

  const deleteCoupon = (index) => {
    if (!confirm("Delete this coupon?")) return;
    setCoupons((current) => {
      const filtered = current.filter((_, i) => i !== index);
      persistCouponsToStorage(filtered);
      return filtered;
    });
  };

  return (
    <AdminLayout>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold">Manage Coupons</h2>
          <Button variant="primary" onClick={() => openForm()}>
            + Add Coupon
          </Button>
        </div>

        <Table bordered hover responsive className="coupon-table">
          <thead className="table-dark text-center">
            <tr>
              <th>#</th>
              <th>Coupon Title</th>
              <th>Code</th>
              <th>Description</th>
              <th>Discount (₹)</th>
              <th>Min Total (₹)</th>
              <th style={{ width: "160px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((coupon, idx) => (
              <tr key={coupon.id || idx}>
                <td className="text-center fw-bold">{idx + 1}</td>
                <td>{coupon.title}</td>
                <td className="fw-bold">{coupon.code}</td>
                <td>{coupon.description}</td>
                <td className="text-center">{Number(coupon.discount || 0)}</td>
                <td className="text-center">{Number(coupon.minTotal || 0)}</td>
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => openForm(idx)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => deleteCoupon(idx)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editIndex !== null ? "Edit Coupon" : "Add Coupon"}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Coupon Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Coupon Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Discount Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Minimum Order (₹) - optional</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={formData.minTotal}
                  onChange={(e) => setFormData({ ...formData, minTotal: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>

            <Button variant="success" onClick={saveCoupon}>
              Save Coupon
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
}
