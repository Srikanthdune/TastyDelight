// src/Pages/ProductsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Form } from "react-bootstrap";
import { FaShoppingCart } from "react-icons/fa";
import { useParams } from "react-router-dom";
import styles from "../Styles/ProductsPage.module.css";

const LS_KEY = "admin_products_v1";
const CART_KEY = "cart";

function uid(prefix = "p") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function sampleProducts() {
  const cat = ["Starters", "Pizzas", "Burgers", "Biryani", "Desserts", "Drinks"];
  return cat.flatMap((c) =>
    Array.from({ length: 3 }).map((_, i) => ({
      id: uid("demo"),
      title: `${c} Item ${i + 1}`,
      desc:
        i % 2 === 0
          ? "Crispy, fresh and delicious."
          : "Rich flavour, best served hot.",
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
          : Number(p.original) || Number(p.price) || 0,
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

/* small SVG fallback data-URI */
const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='480'>
      <rect width='100%' height='100%' fill='#f6f6f6'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#888' font-family='Arial,Helvetica,sans-serif' font-size='20'>No image</text>
    </svg>`
  );

/* ProductCard — keeps image in DOM, swaps to fallback on error, fade-in */
function ProductCard({ p, onAdd, added }) {
  const [src, setSrc] = useState(p.img || FALLBACK_SVG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSrc(p.img || FALLBACK_SVG);
    setLoaded(false);
  }, [p.img, p.id]);

  const handleError = () => {
    if (src !== FALLBACK_SVG) setSrc(FALLBACK_SVG);
  };
  const handleLoad = () => setLoaded(true);

  const save = Math.max(0, (p.original || p.price) - p.price);
  return (
    <Card className={styles.productCard} style={{ position: "relative" }}>
      {added && (
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}>
          <Badge bg="success">Added</Badge>
        </div>
      )}

      <div className={styles.imgWrap}>
        <img
          src={src}
          alt={p.title}
          className={`${styles.cardImg} ${
            loaded ? styles.loaded : styles.loading
          }`}
          loading="lazy"
          onError={handleError}
          onLoad={handleLoad}
          width="100%"
          height="160"
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
          <Badge pill className={styles.savePill}>
            Save ₹{save}
          </Badge>
        </div>

        <Button className={styles.addBtn} onClick={() => onAdd(p)}>
          <FaShoppingCart className="me-2" /> Add to Cart
        </Button>
      </Card.Body>
    </Card>
  );
}

export default function ProductsPage() {
  const { category: categorySlug } = useParams();

  const [products, setProducts] = useState(() => {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? normaliseStoredProducts(raw) : null;
    return parsed && parsed.length ? parsed : sampleProducts();
  });

  const [justAddedId, setJustAddedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // fetch /data/products.json on mount if available (public folder)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch("/data/products.json", { cache: "no-cache" });
        if (!resp.ok) throw new Error("Not found");
        const arr = await resp.json();
        if (!mounted) return;
        if (Array.isArray(arr) && arr.length) {
          const normalized = arr.map((p, idx) => ({
            id: p.id ?? `p_${idx}`,
            title: p.title ?? p.name ?? "",
            desc: p.desc ?? "",
            img: p.img ?? p.image ?? `/images/default-${(idx % 6) + 1}.jpg`,
            price:
              typeof p.price === "number" ? p.price : Number(p.price) || 0,
            original:
              typeof p.original === "number"
                ? p.original
                : Number(p.original) || Number(p.price) || 0,
            category: p.category ?? "Uncategorized",
            featured: !!p.featured,
          }));
          try {
            localStorage.setItem(LS_KEY, JSON.stringify(normalized));
          } catch (e) {}
          setProducts(normalized);
        }
      } catch (err) {
        // keep localStorage/sample if fetch fails
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onProductsUpdated = (ev) => {
      if (ev && ev.detail && Array.isArray(ev.detail)) {
        setProducts(
          ev.detail.map((p, idx) => ({
            id: p.id ?? `p_${idx}`,
            title: p.title ?? p.name ?? "",
            desc: p.desc ?? "",
            img: p.img ?? p.image ?? `/images/default-${(idx % 6) + 1}.jpg`,
            price:
              typeof p.price === "number" ? p.price : Number(p.price) || 0,
            original:
              typeof p.original === "number"
                ? p.original
                : Number(p.original) || Number(p.price) || 0,
            category: p.category ?? "Uncategorized",
            featured: !!p.featured,
          }))
        );
        return;
      }

      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? normaliseStoredProducts(raw) : null;
      if (parsed && parsed.length) setProducts(parsed);
    };

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
    const order = [
      "Starters",
      "Pizzas",
      "Burgers",
      "Biryani",
      "Desserts",
      "Drinks",
    ];
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
    Array.from(map.keys())
      .sort()
      .forEach((k) => ordered.push({ name: k, items: map.get(k) }));
    return ordered;
  }, [products]);

  // when /products/:category is used, set that as selected filter
  useEffect(() => {
    if (!categorySlug || !categories.length) return;
    const slug = decodeURIComponent(categorySlug);
    const found = categories.find(
      (c) => normalizeForMatch(c.name) === slug
    );
    if (found) {
      setSelectedCategory(found.name);
    }
  }, [categorySlug, categories]);

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
      updated = current.map((i) =>
        i.id === cartItem.id ? { ...i, qty: (i.qty || 0) + 1 } : i
      );
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

  const visibleCategories =
    selectedCategory === "ALL"
      ? categories
      : categories.filter((c) => c.name === selectedCategory);

  return (
    <Container fluid className={styles.pageWrap}>
      <Container className={styles.inner}>
        {/* 🔽 Category Filter Dropdown (replaces buttons) */}
        <div className={styles.topNav}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </Form.Select>
        </div>

        {visibleCategories.length ? (
          <>
            {visibleCategories.map((cat) => (
              <section
                key={cat.name}
                id={normalizeForMatch(cat.name)}
                className={styles.section}
              >
              <h3 className={styles.sectionTitle}>{cat.name}</h3>
                <Row className="g-4">
                  {cat.items.map((p) => (
                    <Col key={p.id} xs={12} sm={6} md={4} lg={3}>
                      <ProductCard
                        p={p}
                        onAdd={addToCart}
                        added={justAddedId === p.id}
                      />
                    </Col>
                  ))}
                </Row>
              </section>
            ))}
          </>
        ) : (
          <div style={{ padding: 24 }}>No products in this category.</div>
        )}
      </Container>
    </Container>
  );
}
