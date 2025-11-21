// src/Admin/Pages/AdminProductsPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import AdminLayout from "../Components/AdminLayout";
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
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LS_KEY = "admin_products_v1";
const CATS_KEY = "admin_categories_v1";

function uid(prefix = "p") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/* Sample products used when storage is empty */
const sampleProducts = () => {
  const cat = ["Starters", "Pizzas", "Burgers", "Biryani", "Desserts", "Drinks"];
  return cat.flatMap((c) =>
    Array.from({ length: 3 }).map((_, i) => ({
      id: uid("demo"),
      title: `${c} Demo ${i + 1}`,
      desc: "Delicious and freshly prepared.",
      img: "",
      price: 120 + (i + 1) * 50,
      original: 160 + (i + 1) * 50,
      category: c,
      featured: i === 0,
    }))
  );
};

/*
  useProducts hook — returns stable functions so consumers can safely
  include them in useEffect deps without causing infinite loops.
*/
function useProducts() {
  const readStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to read products from storage", e);
    }
    const init = sampleProducts();
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(init));
    } catch (e) { /* ignore */ }
    return init;
  }, []);

  const [products, setProductsState] = useState(readStorage);

  const persistAndBroadcast = useCallback((next) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to write products to storage", e);
    }
    try {
      window.dispatchEvent(new CustomEvent("products-updated", { detail: next }));
    } catch (e) {
      console.warn("Failed to dispatch products-updated event", e);
    }
  }, []);

  // setProducts is stable thanks to useCallback
  const setProducts = useCallback((next) => {
    setProductsState((cur) => {
      const resolved = typeof next === "function" ? next(cur) : next;
      persistAndBroadcast(resolved);
      return resolved;
    });
  }, [persistAndBroadcast]);

  const add = useCallback((p) => {
    setProducts((cur) => [p, ...cur]);
  }, [setProducts]);

  const update = useCallback((id, data) => {
    setProducts((cur) => cur.map((it) => (it.id === id ? { ...it, ...data } : it)));
  }, [setProducts]);

  const remove = useCallback((id) => {
    setProducts((cur) => cur.filter((it) => it.id !== id));
  }, [setProducts]);

  return { products, add, update, remove, setProducts };
}

/* Load categories (titles) from storage */
function loadCategoriesFromStorage() {
  try {
    const raw = localStorage.getItem(CATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c) => (typeof c === "string" ? c : c.title || c.name || "")).filter(Boolean);
  } catch (e) {
    console.error("Failed to load categories", e);
    return [];
  }
}

const ProductCardAdmin = React.memo(function ProductCardAdmin({ p, onEdit, onDelete }) {
  const save = Math.max(0, (p.original || p.price) - p.price);
  return (
    <Card className="h-100">
      <div style={{ height: 160, overflow: "hidden", display: "grid", placeItems: "center" }}>
        {p.img ? (
          <img
            src={p.img}
            alt={p.title}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f6f6", color: "#888" }}>
            No image
          </div>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="mb-1">{p.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted" style={{ fontSize: 13 }}>
          {p.category} {p.featured && <Badge bg="info" className="ms-2">Featured</Badge>}
        </Card.Subtitle>
        <Card.Text className="flex-grow-1" style={{ fontSize: 14 }}>{p.desc}</Card.Text>

        <div className="d-flex align-items-center justify-content-between mt-2">
          <div>
            <div style={{ fontWeight: 700 }}>₹{p.price}</div>
            <div style={{ textDecoration: "line-through", fontSize: 12 }}>₹{p.original}</div>
            <div style={{ fontSize: 12 }}>Save ₹{save}</div>
          </div>

          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={() => onEdit(p)}>
              <FaEdit />
            </Button>
            <Button variant="outline-danger" size="sm" onClick={() => onDelete(p)}>
              <FaTrash />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
});

/* ProductForm — unchanged (uses image URL) */
function ProductForm({ initial = null, onCancel, onSubmit, categories = [] }) {
  const defaultCategory = categories && categories.length ? categories[0] : "Starters";

  const [form, setForm] = useState(
    initial || {
      title: "",
      desc: "",
      img: "",
      price: "",
      original: "",
      category: defaultCategory,
      featured: false,
    }
  );

  useEffect(() => {
    setForm(
      initial || {
        title: "",
        desc: "",
        img: "",
        price: "",
        original: "",
        category: defaultCategory,
        featured: false,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, defaultCategory]);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      category: initial?.category || (categories && categories.length ? categories[0] : f.category),
    }));
  }, [categories, initial]);

  const change = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [k]: val }));
  };

  const pasteUrl = () => {
    const url = window.prompt("Paste image URL (http(s)...)");
    if (url) setForm((s) => ({ ...s, img: url }));
  };

  const removeImage = () => setForm((s) => ({ ...s, img: "" }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title is required");
    if (!form.price || Number(form.price) <= 0) return alert("Provide a valid price");

    const payload = {
      ...form,
      price: Number(form.price),
      original: Number(form.original || form.price),
      id: initial?.id || uid("p"),
    };
    onSubmit(payload);
  };

  return (
    <Form onSubmit={submit}>
      <Form.Group className="mb-2">
        <Form.Label>Title</Form.Label>
        <Form.Control value={form.title} onChange={change("title")} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={2} value={form.desc} onChange={change("desc")} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Category</Form.Label>
        <Form.Select value={form.category} onChange={change("category")}>
          {categories && categories.length ? (
            categories.map((c) => <option key={c} value={c}>{c}</option>)
          ) : (
            <>
              <option>Starters</option>
              <option>Pizzas</option>
              <option>Burgers</option>
              <option>Biryani</option>
              <option>Desserts</option>
              <option>Drinks</option>
            </>
          )}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Image URL</Form.Label>
        <InputGroup>
          <Form.Control value={form.img} onChange={change("img")} placeholder="/images/... or https://..." />
          <Button variant="outline-secondary" onClick={pasteUrl}>Paste URL</Button>
          <Button variant="outline-danger" onClick={removeImage}>Remove</Button>
        </InputGroup>

        {form.img ? (
          <div style={{ marginTop: 8 }}>
            <img src={form.img} alt="preview" style={{ maxWidth: 180, maxHeight: 90, objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </div>
        ) : (
          <div style={{ marginTop: 6, color: "#666", fontSize: 13 }}>No image URL provided.</div>
        )}
      </Form.Group>

      <Row>
        <Col>
          <Form.Group className="mb-2">
            <Form.Label>Price (₹)</Form.Label>
            <Form.Control type="number" value={form.price} onChange={change("price")} />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-2">
            <Form.Label>Original (₹)</Form.Label>
            <Form.Control type="number" value={form.original} onChange={change("original")} />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="featuredCheck">
        <Form.Check type="checkbox" label="Featured" checked={form.featured} onChange={change("featured")} />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
        <Button variant="primary" type="submit">Save Product</Button>
      </div>
    </Form>
  );
}

/* AdminProductsPage component */
export default function AdminProductsPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/Admin/auth/login", { replace: true });
  }, [navigate]);

  const { products, add, update, remove, setProducts } = useProducts();

  const [categories, setCategories] = useState(() => {
    const loaded = loadCategoriesFromStorage();
    return loaded.length ? loaded : ["Starters", "Pizzas", "Burgers", "Biryani", "Desserts", "Drinks"];
  });

  useEffect(() => {
    const load = () => {
      const loaded = loadCategoriesFromStorage();
      if (loaded.length) setCategories(loaded);
      else setCategories(["Starters","Pizzas","Burgers","Biryani","Desserts","Drinks"]);
    };

    load();
    const onStorage = (ev) => {
      if (ev.key === CATS_KEY) load();
      if (ev.key === LS_KEY) {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setProducts(parsed); // safe: setProducts is stable
          } catch (e) {}
        }
      }
    };
    const onCustom = () => load();
    window.addEventListener("storage", onStorage);
    window.addEventListener("categories-updated", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("categories-updated", onCustom);
    };
  }, [setProducts]); // setProducts is stable now (memoized)

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({ show: false, product: null });

  // debounced search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchTerm.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Memoized filtered products
  const filtered = useMemo(() => {
    if (!debouncedQuery) return products;
    const q = debouncedQuery;
    return products.filter((p) =>
      (p.title || "").toLowerCase().includes(q) ||
      (p.desc || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  }, [products, debouncedQuery]);

  // Memoized categories from filtered products
  const categoriesFromProducts = useMemo(() => {
    return Array.from(new Set(filtered.map((p) => p.category))).sort((a, b) => a.localeCompare(b));
  }, [filtered]);

  // Accordion active category (controlled) to render only one body at a time
  const [activeCategory, setActiveCategory] = useState(categoriesFromProducts[0] || null);
  useEffect(() => {
    if (!activeCategory && categoriesFromProducts.length) setActiveCategory(categoriesFromProducts[0]);
    if (activeCategory && !categoriesFromProducts.includes(activeCategory)) {
      setActiveCategory(categoriesFromProducts[0] || null);
    }
  }, [categoriesFromProducts, activeCategory]);

  // Stable callbacks
  const openAdd = useCallback(() => { setEditing(null); setShowModal(true); }, []);
  const openEdit = useCallback((p) => { setEditing(p); setShowModal(true); }, []);
  const handleDelete = useCallback((p) => setConfirm({ show: true, product: p }), []);
  const onFormSubmit = useCallback((payload) => {
    if (editing) update(editing.id, payload);
    else add(payload);
    setShowModal(false);
    setEditing(null);
  }, [editing, update, add]);

  const confirmDelete = () => {
    const id = confirm.product?.id;
    if (!id) return setConfirm({ show: false, product: null });
    remove(id);
    setConfirm({ show: false, product: null });
  };

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4>Admin — Products</h4>

            <div className="d-flex align-items-center gap-2">
              <Form.Control
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 240 }}
              />
              <Button variant="outline-secondary" onClick={() => setProducts(sampleProducts())}>Reset Demo</Button>
              <Button variant="success" onClick={openAdd}><FaPlus className="me-2" /> Add New Product</Button>
            </div>
          </div>

          {categoriesFromProducts.length === 0 ? (
            <div>No products found</div>
          ) : (
            <Accordion activeKey={activeCategory}>
              {categoriesFromProducts.map((cat) => {
                const items = filtered.filter((p) => p.category === cat);
                return (
                  <Accordion.Item eventKey={cat} key={cat}>
                    <Accordion.Header onClick={() => setActiveCategory((s) => (s === cat ? null : cat))}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <strong>{cat}</strong>
                        <Badge bg="secondary">{items.length}</Badge>
                      </div>
                    </Accordion.Header>

                    {activeCategory === cat ? (
                      <Accordion.Body>
                        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                          {items.map((p) => (
                            <Col key={p.id}><ProductCardAdmin p={p} onEdit={openEdit} onDelete={handleDelete} /></Col>
                          ))}
                        </Row>
                      </Accordion.Body>
                    ) : null}
                  </Accordion.Item>
                );
              })}
            </Accordion>
          )}

          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton><Modal.Title>{editing ? "Edit Product" : "Add New Product"}</Modal.Title></Modal.Header>
            <Modal.Body>
              <ProductForm initial={editing} onCancel={() => setShowModal(false)} onSubmit={onFormSubmit} categories={categories} />
            </Modal.Body>
          </Modal>

          <Modal show={confirm.show} onHide={() => setConfirm({ show: false, product: null })}>
            <Modal.Header closeButton><Modal.Title>Delete product</Modal.Title></Modal.Header>
            <Modal.Body>Are you sure you want to permanently delete <strong>{confirm.product?.title}</strong>?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setConfirm({ show: false, product: null })}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </Container>
    </AdminLayout>
  );
}
