 




import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Products from "./pages/products.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/about.jsx";

import Profile from "./pages/profile.jsx";
import Categories from "./pages/Categories.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout";

// Admin imports abhi comment hain
// import AdminLayout from "./admin/AdminLayout";
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import AdminProducts from "./pages/admin/AdminProducts";
// import AdminCategories from "./pages/admin/AdminCategories";
// import AdminOrders from "./pages/admin/AdminOrders";
// import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isLoggedIn = Boolean(token && user);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  // Admin page check abhi use nahi ho raha
  // const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Show navbar only after login */}
      {isLoggedIn && !isAuthPage && <Navbar />}

      <main className="min-h-screen">
        <Routes>
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Register */}
          <Route path="/register" element={<Register />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/Categories" element={<Categories />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          {/* Admin routes abhi comment hain */}
          {/*
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>
          */}

          {/* Unknown routes */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </main>

      {/* Show footer only after login */}
      {isLoggedIn && !isAuthPage && <Footer />}
    </>
  );
}

export default App;
