 






import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";

// User pages and components
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
import Checkout from "./pages/Checkout.jsx";

function App() {
  const location = useLocation();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token && user);
  const isAdmin = user?.role === "admin";

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  // Hide the normal navbar/footer on admin pages
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {isLoggedIn && !isAuthPage && !isAdminPage && <Navbar />}

      <main className="min-h-screen">
        <Routes>
          {/* Public authentication pages */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate
                  to={isAdmin ? "/admin" : "/"}
                  replace
                />
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate
                  to={isAdmin ? "/admin" : "/"}
                  replace
                />
              ) : (
                <Register />
              )
            }
          />

         {/* Admin-only pages */}
<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/admin/products" element={<AdminProducts />} />
  <Route path="/admin/categories" element={<AdminCategories />} />
  <Route path="/admin/orders" element={<AdminOrders />} />
  <Route path="/admin/users" element={<AdminUsers />} />
</Route>

{/* All logged-in users: User + Admin */}
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/wishlist" element={<Wishlist />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/categories" element={<Categories />} />
  <Route path="/products" element={<Products />} />
  <Route path="/products/:id" element={<ProductDetails />} />
  <Route path="/checkout" element={<Checkout />} />
</Route>
          <Route
            path="*"
            element={
              <Navigate
                to={isLoggedIn ? (isAdmin ? "/admin" : "/") : "/login"}
                replace
              />
            }
          />
        </Routes>
      </main>

      {isLoggedIn && !isAuthPage && !isAdminPage && <Footer />}
    </>
  );
}

export default App;
