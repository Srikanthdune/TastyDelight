// src/Pages/ProductsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import styles from "../Styles/ProductsPage.module.css";

const LS_KEY = "admin_products_v1";
const CART_KEY = "cart";

function uid(prefix = "p") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function sampleProducts() {
  const cat = ["Starters", "Pizzas", "Burgers", "Biryani", "Desserts", "Drinks"];
  return cat.flatMap((c) =>
    Array.from({ length: 6 }).map((_, i) => ({
      id: uid("demo"),
      title: `${c} Item ${i + 1}`,
      desc: i % 2 === 0 ? "Crispy, fresh and delicious." : "Rich flavour, best served hot.",
      img: `/images/${c.toLowerCase()}-${(i % 6) + 1}.jpg`,
      price: 120 + (i + 1) * 30,
      original: 150 + (i + 1) * 30,
      category: c,
    }))
  );
}

function normaliseStoredProducts(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((p, idx) => ({
      id: p.id ?? `p_${idx}`,
      title: p.title ?? p.name ?? `Item ${idx + 1}`,
      desc: p.desc ?? "",
      img: p.img ?? p.image ?? `/images/default-${(idx % 6) + 1}.jpg`,
      price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
      original:
        typeof p.original === "number"
          ? p.original
          : Number(p.original) || (Number(p.price) || 0),
      category: p.category ?? "Uncategorized",
      featured: !!p.featured,
    }));
  } catch (e) {
    return null;
  }
}

function normalizeForMatch(title = "") {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function ProductCard({ p, onAdd, added }) {
  const save = Math.max(0, (p.original || p.price) - p.price);
  return (
    <Card className={styles.productCard} style={{ position: "relative" }}>
      {added && (
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}>
          <Badge bg="success">Added</Badge>
        </div>
      )}

      <div className={styles.imgWrap}>
        <Card.Img
          src={p.img}
          alt={p.title}
          className={styles.cardImg}
          loading="lazy"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className={styles.title}>{p.title}</Card.Title>
        <Card.Text className={styles.desc}>{p.desc}</Card.Text>

        <div className="d-flex align-items-center gap-2 mt-2 mb-3">
          <div className={styles.priceWrap}>
            <div className={styles.price}>₹{p.price}</div>
            <div className={styles.original}>₹{p.original}</div>
          </div>
          <Badge pill className={styles.savePill}>Save ₹{save}</Badge>
        </div>

        <Button className={styles.addBtn} onClick={() => onAdd(p)}>
          <FaShoppingCart className="me-2" /> Add to Cart
        </Button>
      </Card.Body>
    </Card>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const { category: categorySlug } = useParams();
  const location = useLocation();

  const [products, setProducts] = useState(() => {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? normaliseStoredProducts(raw) : null;
    return parsed && parsed.length ? parsed : sampleProducts();
  });

  const [justAddedId, setJustAddedId] = useState(null);

  useEffect(() => {
    // handler for custom event from admin page (same-tab)
    const onProductsUpdated = (ev) => {
      if (ev && ev.detail && Array.isArray(ev.detail)) {
        // use the provided list directly
        setProducts(ev.detail.map((p, idx) => ({
          id: p.id ?? `p_${idx}`,
          title: p.title ?? p.name ?? "",
          desc: p.desc ?? "",
          img: p.img ?? p.image ?? `/images/default-${(idx % 6) + 1}.jpg`,
          price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
          original: typeof p.original === "number" ? p.original : Number(p.original) || (Number(p.price) || 0),
          category: p.category ?? "Uncategorized",
          featured: !!p.featured,
        })));
        return;
      }

      // otherwise, read fresh from localStorage (other-tab updates)
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? normaliseStoredProducts(raw) : null;
      if (parsed && parsed.length) setProducts(parsed);
    };

    // storage event for other tabs
    const onStorage = (ev) => {
      if (ev.key === LS_KEY) {
        const parsed = ev.newValue ? normaliseStoredProducts(ev.newValue) : null;
        if (parsed && parsed.length) setProducts(parsed);
      }
    };

    window.addEventListener("products-updated", onProductsUpdated);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("products-updated", onProductsUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const categories = useMemo(() => {
    const map = new Map();
    const order = ["Starters", "Pizzas", "Burgers", "Biryani", "Desserts", "Drinks"];
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    });
    const ordered = [];
    order.forEach((o) => {
      if (map.has(o)) {
        ordered.push({ name: o, items: map.get(o) });
        map.delete(o);
      }
    });
    Array.from(map.keys()).sort().forEach((k) => ordered.push({ name: k, items: map.get(k) }));
    return ordered;
  }, [products]);

  const activeCategory = useMemo(() => {
    if (!categorySlug) return null;
    const slug = decodeURIComponent(categorySlug);
    const found = categories.find((c) => normalizeForMatch(c.name) === slug);
    return found || null;
  }, [categorySlug, categories]);

  useEffect(() => {
    if (!location?.hash) return;
    const id = location.hash.replace("#", "");
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 110;
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }, 120);
    return () => clearTimeout(t);
  }, [location.hash, products, categories]);

  const addToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.title,
      price: Number(product.price) || 0,
      image: product.img,
      qty: 1,
    };

    const raw = localStorage.getItem(CART_KEY);
    const current = raw ? JSON.parse(raw) : [];

    const exists = current.find((i) => i.id === cartItem.id);
    let updated;
    if (exists) {
      updated = current.map((i) => (i.id === cartItem.id ? { ...i, qty: (i.qty || 0) + 1 } : i));
    } else {
      updated = [...current, cartItem];
    }

    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: updated }));

    setJustAddedId(product.id);
    window.setTimeout(() => {
      setJustAddedId((cur) => (cur === product.id ? null : cur));
    }, 1800);
  };

  return (
    <Container fluid className={styles.pageWrap}>
      <Container className={styles.inner}>
        <div className={styles.topNav}>
          {activeCategory ? (
            <>
              <Link to="/products" className={styles.topNavLink}>← Back to all categories</Link>
              <span className={styles.topNavActive}>{activeCategory.name}</span>
            </>
          ) : (
            categories.map((c) => {
              const anchor = `#${normalizeForMatch(c.name)}`;
              return (
                <a key={c.name} href={anchor} className={styles.topNavLink}>{c.name}</a>
              );
            })
          )}
        </div>

        {activeCategory ? (
          <section id={normalizeForMatch(activeCategory.name)} className={styles.section}>
            <h3 className={styles.sectionTitle}>{activeCategory.name}</h3>
            <Row className="g-4">
              {activeCategory.items.map((p) => (
                <Col key={p.id} xs={12} sm={6} md={4} lg={3}>
                  <ProductCard p={p} onAdd={addToCart} added={justAddedId === p.id} />
                </Col>
              ))}
            </Row>
          </section>
        ) : (
          <>
            {categories.map((cat) => (
              <section key={cat.name} id={normalizeForMatch(cat.name)} className={styles.section}>
                <h3 className={styles.sectionTitle}>{cat.name}</h3>
                <Row className="g-4">
                  {cat.items.map((p) => (
                    <Col key={p.id} xs={12} sm={6} md={4} lg={3}>
                      <ProductCard p={p} onAdd={addToCart} added={justAddedId === p.id} />
                    </Col>
                  ))}
                </Row>
              </section>
            ))}
          </>
        )}

        {categorySlug && !activeCategory && <div style={{ padding: 24 }}>No products in this category.</div>}
      </Container>
    </Container>
  );
}
