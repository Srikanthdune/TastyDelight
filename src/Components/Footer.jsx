import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import styles from "../Styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Container>
        <Row className="gy-4">
          {/* Brand Info */}
          <Col md={4} sm={12}>
            <h5 className={styles.brand}>Tasty Delight</h5>
            <p className={styles.text}>
              Serving happiness through fresh, flavorful dishes every day.
              Taste the difference with every bite!
            </p>
          </Col>

          {/* Quick Links */}
          <Col md={4} sm={6}>
            <h6 className={styles.heading}>Quick Links</h6>
            <ul className={styles.links}>
              <li><a href="/">Home</a></li>
              <li><a href="/categories">Categories</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </Col>

          {/* Contact & Social */}
          <Col md={4} sm={6}>
            <h6 className={styles.heading}>Contact Us</h6>
            <p className={styles.text}>
              📍 Mumbai, India<br />
              📞 +91 98765 43210<br />
              ✉️ support@tastydelight.com
            </p>
            <div className={styles.socialIcons}>
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaTwitter /></a>
            </div>
          </Col>
        </Row>

        <hr className={styles.divider} />
        <p className={styles.copy}>
          © {new Date().getFullYear()} Tasty Delight. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
