// src/Admin/Pages/Products.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  InputGroup,
  Badge,
  Accordion,
  Alert,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../Components/AdminLayout";

const LS_KEY = "admin_products_v1";

function uid(prefix = "p") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const FALLBACK_IMG =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iMTgiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

function useProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            return;
          }
        } catch (e) {
          console.error("Corrupted localStorage", e);
        }
      }

      try {
        const res = await fetch("/data/Products.json?t=" + Date.now());
        if (!res.ok) throw new Error();
        const data = await res.json();

        const normalized = data.map(p => ({
          id: p.id || uid("p"),
          title: p.title || "Untitled",
          desc: p.desc || "",
          img: p.img || "",
          price: Number(p.price) || 0,
          original: Number(p.original) || Number(p.price) || 0,
          category: p.category || "Uncategorized",
          featured: !!p.featured,
        }));

        localStorage.setItem(LS_KEY, JSON.stringify(normalized));
        setProducts(normalized);
      } catch (err) {
        console.error("Failed to load Products.json", err);
        setProducts([]);
      }
    };

    loadProducts();

    const handler = () => loadProducts();
    window.addEventListener("storage", handler);
    window.addEventListener("products-updated", handler);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("products-updated", handler);
    };
  }, []);

  const save = useCallback((list) => {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("products-updated"));
  }, []);

  const add = useCallback((product) => {
    setProducts(prev => {
      const updated = [{ ...product, id: uid("p") }, ...prev];
      save(updated);
      return updated;
    });
  }, [save]);

  const update = useCallback((id, data) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, ...data } : p));
      save(updated);
      return updated;
    });
  }, [save]);

  const remove = useCallback((id) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      save(updated);
      return updated;
    });
  }, [save]);

  const reset = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    window.location.reload();
  }, []);

  return { products, add, update, remove, reset };
}

const ProductCard = React.memo(function ProductCard({ p, onEdit, onDelete }) {
  const save = Math.max(0, p.original - p.price);

  return (
    <Card className="h-100 shadow-sm border-0">
      <div style={{ height: 180, overflow: "hidden", background: "#f9f9f9" }}>
        <img
          src={p.img || FALLBACK_IMG}
          alt={p.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
        />
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6 fw-bold">{p.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted small">
          {p.category}{" "}
          {p.featured && <Badge bg="success" className="ms-2">Featured</Badge>}
        </Card.Subtitle>
        <Card.Text className="small text-muted flex-grow-1">{p.desc}</Card.Text>

        <div className="mt-auto d-flex justify-content-between align-items-end">
          <div>
            <div className="fw-bold text-success">₹{p.price}</div>
            {p.original > p.price && (
              <>
                <div className="text-decoration-line-through text-muted small">₹{p.original}</div>
                <small className="text-danger">Save ₹{save}</small>
              </>
            )}
          </div>
          <div className="d-flex gap-2">
            {/* EDIT BUTTON FIXED BELOW */}
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => onEdit(p)}  // This triggers edit mode
            >
              Edit
            </Button>
            <Button size="sm" variant="outline-danger" onClick={() => onDelete(p)}>
              Delete
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
});

function ProductForm({ initial, onCancel, onSubmit, categories }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    desc: initial?.desc || "",
    img: initial?.img || "",
    price: initial?.price || "",
    original: initial?.original || "",
    category: initial?.category || categories[0] || "Starters",
    featured: initial?.featured || false,
  });

  const handleChange = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title is required");
    if (!form.price || Number(form.price) <= 0) return alert("Valid price required");

    onSubmit({
      ...form,
      id: initial?.id || uid("p"),
      price: Number(form.price),
      original: Number(form.original || form.price),
    });
  };

  return (
    <Form onSubmit={submit}>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Title *</Form.Label><Form.Control value={form.title} onChange={handleChange("title")} required /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Category</Form.Label><Form.Select value={form.category} onChange={handleChange("category")}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</Form.Select></Form.Group></Col>
      </Row>

      <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={2} value={form.desc} onChange={handleChange("desc")} /></Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Image URL</Form.Label>
        <InputGroup>
          <Form.Control value={form.img} onChange={handleChange("img")} placeholder="/images/..." />
          <Button variant="outline-secondary" onClick={() => {
            const url = prompt("Paste image URL");
            if (url?.trim()) setForm(prev => ({ ...prev, img: url.trim() }));
          }}>Paste</Button>
        </InputGroup>
        {form.img && <img src={form.img} alt="Preview" className="mt-3 rounded shadow-sm" style={{ maxHeight: 140, maxWidth: "100%", objectFit: "cover" }} onError={e => e.currentTarget.src = FALLBACK_IMG} />}
      </Form.Group>

      <Row>
        <Col><Form.Group className="mb-3"><Form.Label>Price (₹) *</Form.Label><Form.Control type="number" value={form.price} onChange={handleChange("price")} required /></Form.Group></Col>
        <Col><Form.Group className="mb-3"><Form.Label>Original Price (₹)</Form.Label><Form.Control type="number" value={form.original} onChange={handleChange("original")} /></Form.Group></Col>
      </Row>

      <Form.Check type="switch" label="Featured Item" checked={form.featured} onChange={handleChange("featured")} className="mb-4" />

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="success" type="submit">Save Product</Button>
      </div>
    </Form>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const { products, add, update, remove, reset } = useProducts();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/Admin/auth/login", { replace: true });
    }
  }, [navigate]);

  const categories = ["Starters", "Pizzas", "Burgers", "Biryani", "Desserts", "Drinks"];

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(p => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category).push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // EDIT BUTTON NOW WORKS!
  const handleEdit = (product) => {
    setEditing(product);
    setShowModal(true);  // This line was missing before!
  };

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Manage Products ({products.length})</h3>
            <div className="d-flex gap-2">
              <Form.Control placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 300 }} />
              <Button variant="outline-warning" onClick={reset}>Reset to Default</Button>
              <Button variant="success" onClick={() => { setEditing(null); setShowModal(true); }}>
                Add Product
              </Button>
            </div>
          </div>

          {products.length === 0 ? (
            <Alert variant="info">Loading products...</Alert>
          ) : (
            <Accordion defaultActiveKey={grouped[0]?.[0]}>
              {grouped.map(([cat, items]) => (
                <Accordion.Item eventKey={cat} key={cat}>
                  <Accordion.Header>
                    <strong>{cat}</strong> <Badge bg="secondary" className="ms-2">{items.length}</Badge>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                      {items.map(p => (
                        <Col key={p.id}>
                          <ProductCard
                            p={p}
                            onEdit={handleEdit}        // Fixed: now opens modal
                            onDelete={setConfirmDelete}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          )}

          {/* Edit/Add Modal */}
          <Modal show={showModal} onHide={() => { setShowModal(false); setEditing(null); }} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>{editing ? "Edit Product" : "Add New Product"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ProductForm
                initial={editing}
                onCancel={() => { setShowModal(false); setEditing(null); }}
                onSubmit={(data) => {
                  editing ? update(editing.id, data) : add(data);
                  setShowModal(false);
                  setEditing(null);
                }}
                categories={categories}
              />
            </Modal.Body>
          </Modal>

          {/* Delete Modal */}
          <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)}>
            <Modal.Header closeButton><Modal.Title>Delete Product?</Modal.Title></Modal.Header>
            <Modal.Body>Delete <strong>{confirmDelete?.title}</strong> permanently?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => { remove(confirmDelete.id); setConfirmDelete(null); }}>Delete</Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </Container>
    </AdminLayout>
  );
}