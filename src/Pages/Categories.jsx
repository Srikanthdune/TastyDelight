// src/Pages/Categories.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import styles from "../Styles/Categories.module.css";

const LS_KEY = "admin_categories_v1";

// Fallback default (keeps previous static example list)
const FALLBACK_CATEGORIES = [
  { id: 1, title: "Starters", image: "/images/Starters.jpg" },
  { id: 2, title: "Pizzas", image: "/images/Pizza.jpg" },
  { id: 3, title: "Burgers", image: "/images/burgers.jpg" },
  { id: 4, title: "Biryani", image: "/images/Biryani.jpg" },
  { id: 5, title: "Desserts", image: "/images/desserts.jpg" },
  { id: 6, title: "Drinks", image: "/images/Drinks.jpg" },
];

function normaliseStoredCategories(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    // Convert possible legacy formats to { id, title, image }
    return parsed
      .map((c, idx) => {
        if (typeof c === "string") return { id: `c_${idx}`, title: c, image: "" };
        return {
          id: c.id ?? `c_${idx}`,
          title: c.title ?? c.name ?? "",
          image: c.image ?? c.img ?? "",
        };
      })
      .filter(Boolean);
  } catch (e) {
    return null;
  }
}

// Create a slug from a title (stable, reversible-ish)
function slugify(title = "") {
  return title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace to -
    .replace(/-+/g, "-"); // collapse multiple - to single
}

export default function Categories() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState(() => {
    // Load from localStorage initially
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? normaliseStoredCategories(raw) : null;
    return parsed && parsed.length ? parsed : FALLBACK_CATEGORIES;
  });

  useEffect(() => {
    // Handler for the custom event dispatched by admin UI
    const onCategoriesUpdated = (e) => {
      // event detail is the categories array in admin code
      const detail = e?.detail;
      if (Array.isArray(detail) && detail.length) {
        // normalise detail same way
        const normal = detail.map((c, idx) => ({
          id: c.id ?? `c_${idx}`,
          title: c.title ?? c.name ?? "",
          image: c.image ?? c.img ?? "",
        }));
        setCategories(normal);
        return;
      }

      // fallback: read localStorage (in case other tabs updated it)
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? normaliseStoredCategories(raw) : null;
      if (parsed && parsed.length) setCategories(parsed);
    };

    window.addEventListener("categories-updated", onCategoriesUpdated);

    // Also listen for storage events to catch changes made in other tabs/windows
    const onStorage = (ev) => {
      if (ev.key === LS_KEY) {
        const parsed = ev.newValue ? normaliseStoredCategories(ev.newValue) : null;
        if (parsed && parsed.length) setCategories(parsed);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("categories-updated", onCategoriesUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const filtered = categories.filter((c) =>
    c.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className={`${styles.wrapper} ${styles.fullBleed}`}>
      <div className={styles.wrapperContainer}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>Categories</h2>

          <Form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <Form.Control
                placeholder="Search categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </Form>
        </div>

        <Row className={`g-4 justify-content-center ${styles.grid3x3}`}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, color: "#666" }}>No categories found</div>
          ) : (
            filtered.map((cat) => {
              const slug = slugify(cat.title);
              return (
                <Col key={cat.id} xs={12} sm={6} md={4} lg={4}>
                  <Link
                    to={`/category/${encodeURIComponent(slug)}`}
                    className={styles.linkWrapper}
                    style={{ textDecoration: "none" }}
                  >
                    <Card className={styles.card}>
                      <div className={styles.imgWrap}>
                        <Card.Img
                          src={cat.image || `/images/${cat.title.toLowerCase()}.jpg`}
                          alt={cat.title}
                          className={styles.cardImg}
                          loading="lazy"
                          onError={(e) => {
                            // hide broken image (optional)
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>

                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <Card.Title className={styles.name}>{cat.title}</Card.Title>
                        </div>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              );
            })
          )}
        </Row>
      </div>
    </div>
  );
}
