import React from "react";
import Headers from "../Components/Header";
import Footer from "../Components/Footer";
import Productspage from "./Productspage";

const Product = () => {
  return (
    <>
      <Headers />
       <div className="page-with-header"></div>
      
      <Productspage />

      <Footer />
    </>
  );
};

export default Product;
