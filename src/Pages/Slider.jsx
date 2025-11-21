import React from "react";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  return (
    <Carousel data-bs-theme="dark">
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="/images/slider1.jpg"  // <-- replace with your own image path
          alt="First slide"
          style={{ height: "50vh", objectFit: "cover" }}
        />
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src="/images/slider2.jpg"  // <-- replace with your own image path
          alt="Second slide"
          style={{ height: "50vh", objectFit: "cover" }}
        />
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src="/images/slider3.jpg"  // <-- replace with your own image path
          alt="Third slide"
          style={{ height: "50vh", objectFit: "cover" }}
        />
      </Carousel.Item>
    </Carousel>
  );
};

export default Home;
