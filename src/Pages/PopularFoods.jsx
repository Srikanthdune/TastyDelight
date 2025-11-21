// src/Components/PopularFoods.jsx
import React, { useState } from "react";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import { FaShoppingCart } from "react-icons/fa";
import styles from "../Styles/PopularFoods.module.css";

const CART_KEY = "cart";

const items = [
  {
    id: 1,
    name: "Chicken Briyani",
    desc: "Aromatic basmati rice with spiced chicken.",
    price: 370,
    original: 400,
    img: "/images/Chicken Briyani.jpg",
  },
  {
    id: 2,
    name: "Butter Chicken",
    desc: "Creamy tomato-based chicken curry.",
    price: 320,
    original: 350,
    img: "/images/Butter chicken.jpg",
  },
  {
    id: 3,
    name: "Chicken Wings",
    desc: "Spicy and tangy chicken wings.",
    price: 220,
    original: 250,
    img: "/images/Chicken Wings.jpg",
  },
  {
    id: 4,
    name: "Chocolate Pudding",
    desc: "Rich and creamy dessert and Chocolatey.",
    price: 150,
    original: 180,
    img: "/images/desserts.jpg",
  },
];

export default function PopularFoods() {
  // holds the id of the last-added product for a short feedback
  const [justAddedId, setJustAddedId] = useState(null);

  const addToCart = (product) => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];

      // normalize cart item
      const cartItem = {
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.img,
        qty: 1,
      };

      // merge: increment qty if exists, otherwise push
      const exists = cart.find((c) => c.id === cartItem.id);
      let updated;
      if (exists) {
        updated = cart.map((c) => (c.id === cartItem.id ? { ...c, qty: (c.qty || 0) + 1 } : c));
      } else {
        updated = [...cart, cartItem];
      }

      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      // notify header/other components
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: updated }));

      // show small "Added" badge for feedback
      setJustAddedId(product.id);
      window.setTimeout(() => {
        setJustAddedId((cur) => (cur === product.id ? null : cur));
      }, 1600);
    } catch (err) {
      console.error("Failed to add to cart", err);
      // fallback: set cart with single item
      localStorage.setItem(CART_KEY, JSON.stringify([{
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.img,
        qty: 1,
      }]));
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: null }));
    }
  };

  return (
    <div className={`${styles.section} ${styles.fullBleed}`}>
      <div className={styles.sectionContainer}>
        <h2 className={styles.title}>Popular Foods</h2>

        <Row className="g-4">
          {items.map((it) => (
            <Col key={it.id} xs={12} sm={6} md={4} lg={3}>
              <Card className={styles.card} style={{ position: "relative" }}>
                {/* Added badge */}
                {justAddedId === it.id && (
                  <div style={{ position: "absolute", top: 10, right: 10, zIndex: 5 }}>
                    <Badge bg="success">Added</Badge>
                  </div>
                )}

                <div className={styles.imgWrap}>
                  <Card.Img
                    variant="top"
                    src={it.img}
                    alt={it.name}
                    className={styles.cardImg}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>

                <Card.Body className="d-flex flex-column">
                  <Card.Title className={styles.name}>{it.name}</Card.Title>
                  <Card.Text className={styles.desc}>{it.desc}</Card.Text>

                  <div className="d-flex align-items-center gap-2 mt-2 mb-3">
                    <div className={styles.priceWrap}>
                      <span className={styles.price}>₹{it.price}</span>
                      <span className={styles.original}>₹{it.original}</span>
                    </div>
                    <div className={styles.savePill}>Save ₹{it.original - it.price}</div>
                  </div>

                  <Button
                    className={styles.addBtn}
                    onClick={() => addToCart(it)}
                  >
                    <FaShoppingCart className="me-2" />
                    Add to Cart
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
