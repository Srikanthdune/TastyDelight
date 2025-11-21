import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import styles from "../Styles/About.module.css";

const About = () => {
  return (
    <section className={styles.aboutSection}>
      <Container fluid="md">
        <Row className="align-items-center">
          {/* Left side text */}
          <Col md={6} className={styles.textCol}>
            <h2 className={styles.title}>About Tasty Delight</h2>
            <p className={styles.description}>
              At <strong>Tasty Delight</strong>, we bring people together through great food. Our chefs craft every dish with fresh ingredients and a blend of authentic flavor and modern taste. From cheesy pizzas to flavorful biryanis and rich desserts, every bite is made to delight and make every meal special.
              
            </p>
            
          </Col>

          {/* Right side image */}
          <Col md={6} className={styles.imageCol}>
            <img
              src="/images/Tasty Delight.jpg"
              alt="Tasty food"
              className={styles.aboutImage}
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default About;
