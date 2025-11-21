// src/Admin/Pages/Categories.jsx
import React, { useEffect, useState } from "react";
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
} from "react-bootstrap";

import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LS_KEY = "admin_categories_v1";

function uid(prefix = "c") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/*
  Default categories include image paths.
  Place matching images in /public/images/... or use external URLs.
*/
const DEFAULT_CATEGORIES = [
  { title: "Starters", image: "/images/Starters.jpg" },
  { title: "Pizzas", image: "/images/Pizza.jpg" },
  { title: "Burgers", image: "/images/burgers.jpg" },
  { title: "Biryani", image: "/images/Biryani.jpg" },
  { title: "Desserts", image: "/images/desserts.jpg" },
  { title: "Drinks", image: "/images/Drinks.jpg" },
];

function useCategories() {
  const [cats, setCats] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // old format (strings)
          if (parsed.length && typeof parsed[0] === "string") {
            return parsed.map((t) => ({
              id: uid(t),
              title: t,
              image: "",
            }));
          }
          // object format
          return parsed.map((c) => ({
            id: c.id || uid(c.title),
            title: c.title || "",
            image: c.image || "",
          }));
        }
      }
    } catch (e) {
      console.error("Parse error:", e);
    }

    // default initial categories
    const init = DEFAULT_CATEGORIES.map((d) => ({
      id: uid(d.title),
      title: d.title,
      image: d.image,
    }));

    localStorage.setItem(LS_KEY, JSON.stringify(init));
    return init;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(cats));
      window.dispatchEvent(
        new CustomEvent("categories-updated", { detail: cats })
      );
    } catch (e) {
      console.error("Save error", e);
    }
  }, [cats]);

  const add = (title, image) =>
    setCats((s) => [{ id: uid(title), title, image }, ...s]);

  const update = (id, title, image) =>
    setCats((s) =>
      s.map((c) =>
        c.id === id
          ? {
              ...c,
              title,
              image,
            }
          : c
      )
    );

  const remove = (id) => setCats((s) => s.filter((c) => c.id !== id));

  return { cats, add, update, remove };
}

function CategoryCard({ cat, onEdit, onDelete }) {
  return (
    <Card className="h-100 shadow-sm">
      {cat.image ? (
        <div
          style={{
            height: 140,
            overflow: "hidden",
            display: "grid",
            placeItems: "center",
          }}
        >
          <img
            src={cat.image}
            alt={cat.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        </div>
      ) : null}

      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <Card.Title>{cat.title}</Card.Title>
          <Card.Text style={{ fontSize: 13, color: "#666" }}>Category</Card.Text>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <Button size="sm" variant="outline-primary" onClick={() => onEdit(cat)}>
            <FaEdit /> Edit
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => onDelete(cat)}>
            <FaTrash /> Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

function CategoryForm({ initial = null, onCancel, onSubmit }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [image, setImage] = useState(initial?.image || "");

  useEffect(() => {
    setTitle(initial?.title || "");
    setImage(initial?.image || "");
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return alert("Enter category name");
    onSubmit(t, image?.trim() || "");
  };

  return (
    <Form onSubmit={submit}>
      <Form.Group className="mb-3">
        <Form.Label>Category name</Form.Label>
        <InputGroup>
          <Form.Control
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Image URL</Form.Label>
        <InputGroup>
          <Form.Control
            placeholder="/images/example.jpg or https://..."
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </InputGroup>

        {image ? (
          <div style={{ marginTop: 10 }}>
            <img
              src={image}
              alt="preview"
              style={{
                maxWidth: "100%",
                maxHeight: 160,
                objectFit: "cover",
                borderRadius: 6,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
            No image — you can leave this blank or add an image URL.
          </div>
        )}
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </div>
    </Form>
  );
}

export default function CategoriesAdminWrapper() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/Admin/auth/login", { replace: true });
  }, [navigate]);

  const { cats, add, update, remove } = useCategories();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({ show: false, cat: null });

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setShowModal(true);
  };

  const handleDelete = (cat) => setConfirm({ show: true, cat });

  const confirmDelete = () => {
    remove(confirm.cat.id);
    setConfirm({ show: false, cat: null });
  };

  const onSubmit = (title, image) => {
    if (editing) update(editing.id, title, image);
    else add(title, image);
    setShowModal(false);
    setEditing(null);
  };

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4>Admin — Categories</h4>

          
          <div className="d-flex align-items-center gap-2">
            <Button variant="success" onClick={openAdd}>
              <FaPlus className="me-2" /> Add New Category
            </Button>
          </div>
        </div>

        <Row className="g-3">
          {cats.map((c) => (
            <Col key={c.id} xs={12} sm={6} md={4} lg={3}>
              <CategoryCard
                cat={c}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </Col>
          ))}
        </Row>

        {/* Add / Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editing ? "Edit Category" : "Add Category"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CategoryForm
              initial={editing}
              onCancel={() => setShowModal(false)}
              onSubmit={onSubmit}
            />
          </Modal.Body>
        </Modal>

        {/* Delete confirm */}
        <Modal
          show={confirm.show}
          onHide={() => setConfirm({ show: false, cat: null })}
        >
          <Modal.Header closeButton>
            <Modal.Title>Delete Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete{" "}
            <strong>{confirm.cat?.title}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setConfirm({ show: false, cat: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
}
