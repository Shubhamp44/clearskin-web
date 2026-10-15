

import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#102f29] text-white">
      <div className="mx-auto grid max-w-7xl gap-9 px-5 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 text-2xl font-semibold">
            <Leaf size={29} /> Clear Skin
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-emerald-100/70">
            Natural care. Real results. Discover skincare essentials for
            your everyday routine.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Quick Links</h3>
          <div className="flex flex-col gap-3 text-sm text-emerald-100/70">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/products" className="hover:text-white">Shop All</Link>
            <Link to="/cart" className="hover:text-white">Cart</Link>
            <Link to="/wishlist" className="hover:text-white">Wishlist</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Customer Service</h3>
          <div className="flex flex-col gap-3 text-sm text-emerald-100/70">
            <a href="#footer" className="hover:text-white">Help & Support</a>
            <a href="#footer" className="hover:text-white">Shipping Policy</a>
            <a href="#footer" className="hover:text-white">Return Policy</a>
            <a href="#footer" className="hover:text-white">Privacy Policy</a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">My Account</h3>
          <div className="flex flex-col gap-3 text-sm text-emerald-100/70">
            <Link to="/login" className="hover:text-white">Login / Register</Link>
            <Link to="/profile" className="hover:text-white">My Profile</Link>
            <Link to="/my-orders" className="hover:text-white">My Orders</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-emerald-100/60">
        © {new Date().getFullYear()} Clear Skin. All rights reserved.
      </div>
    </footer>
  );
}