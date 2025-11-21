// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* Public pages */
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import Cart from "./Pages/Cart";
import Productspage from "./Pages/Productspage"; // <-- important: matches filename above
import UserLogin from "./Auth/UserLogin";
import Checkout from "./Pages/Checkout";

/* Admin pages & auth */
import AdminLogin from "./Admin/Auth/Login";
import AdminDashboard from "./Admin/Pages/Dashboard";

/* Admin-managed pages */
import AdminProductsPage from "./Admin/Pages/Products";
import AdminCategories from "./Admin/Pages/Categories";
import AdminCoupons from "./Admin/Pages/Coupons";
import ProductsPage from "./Pages/Productspage";

function RequireAdmin({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/Admin/auth/login" replace />;
  return children;
}

function OrderSuccess() {
  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "40px auto" }}>
      <h2>Order placed successfully!</h2>
      <p>Your order has been received.</p>
      <p><a href="/products">Continue shopping</a></p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />

        {/* Category route — uses Productspage component */}
        <Route path="/category/:category" element={<ProductsPage />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<UserLogin />} />

        {/* Checkout Route */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Admin login */}
        <Route path="/Admin/auth/login" element={<AdminLogin />} />
        <Route path="/admin/auth/login" element={<AdminLogin />} />

        {/* Admin Dashboard */}
        <Route
          path="/Admin/dashboard"
          element={<RequireAdmin><AdminDashboard /></RequireAdmin>}
        />
        <Route
          path="/admin/dashboard"
          element={<RequireAdmin><AdminDashboard /></RequireAdmin>}
        />

        {/* Admin Products */}
        <Route
          path="/Admin/products"
          element={<RequireAdmin><AdminProductsPage /></RequireAdmin>}
        />
        <Route
          path="/admin/products"
          element={<RequireAdmin><AdminProductsPage /></RequireAdmin>}
        />

        {/* Admin Categories */}
        <Route
          path="/Admin/categories"
          element={<RequireAdmin><AdminCategories /></RequireAdmin>}
        />
        <Route
          path="/admin/categories"
          element={<RequireAdmin><AdminCategories /></RequireAdmin>}
        />

        {/* Admin Coupons */}
        <Route
          path="/Admin/coupons"
          element={<RequireAdmin><AdminCoupons /></RequireAdmin>}
        />
        <Route
          path="/admin/coupons"
          element={<RequireAdmin><AdminCoupons /></RequireAdmin>}
        />

        {/* Backward compatibility redirects */}
        <Route path="/Admin/login" element={<Navigate to="/Admin/auth/login" replace />} />
        <Route path="/admin-login" element={<Navigate to="/Admin/auth/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 24 }}>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
