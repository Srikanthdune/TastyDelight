// src/Pages/Home.jsx
import React from 'react'
import Headers from '../Components/Header'
import Slider from './Slider'
import PopularFoods from './PopularFoods'
import Categories from './Categories'
import About from './About'
import Footer from '../Components/Footer'
import '../Styles/Header.modules.css' // import the css

const Home = () => {
  return (
    <>
      <Headers />
      <div style={{ marginTop: "70px" }}></div>
        <Slider />
        <PopularFoods />
        <Categories />
        <About />
        <Footer />
     
    </>
  )
}

export default Home
