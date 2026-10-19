
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

import {
  Leaf,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    loading,
    error,
    success,
    clearMessages,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearMessages?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearMessages?.();

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();

    if (!fullName) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(phone)) {
      toast.error("Phone number must contain 10–15 digits.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const result = await register({
        fullName,
        email,
        phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });

      if (result?.success) {
        toast.success("Registration successful! Please login.");

        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "user",
        });

        navigate("/login", { replace: true });
      } else {
        toast.error(
          result?.message || "Registration failed. Please try again."
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f4] px-4 py-8 sm:py-12">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-xl shadow-stone-200/60 md:grid-cols-2">

        {/* LEFT IMAGE */}
        <div className="relative hidden min-h-[680px] md:block">
          <img
            src="https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1000&q=85"
            alt="Natural skincare products"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#263b2e]/90 via-[#263b2e]/25 to-black/10" />

          <Link
            to="/"
            className="absolute left-9 top-9 flex items-center gap-2 text-white"
          >
            <span className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
              <Leaf size={22} />
            </span>
            <span className="text-xl font-semibold tracking-wide">
              Clear Skin
            </span>
          </Link>

          <div className="absolute bottom-12 left-9 right-9 text-white">
            <p className="mb-3 text-xs font-medium uppercase tracking-[4px] text-green-100">
              Your natural glow starts here
            </p>

            <h1 className="mb-4 font-serif text-4xl font-semibold leading-tight lg:text-5xl">
              Healthy skin.
              <br />
              Happier you.
            </h1>

            <p className="max-w-sm text-sm leading-7 text-white/85">
              Discover thoughtful skincare essentials designed
              to make your everyday routine feel special.
            </p>

            <div className="mt-7 flex items-center gap-3 text-sm text-white/90">
              <CheckCircle size={18} />
              <span>Your journey to better skincare begins today.</span>
            </div>
          </div>
        </div>

        {/* REGISTER FORM */}
        <div className="flex items-center justify-center px-5 py-8 sm:px-10 md:px-8 lg:px-12">
          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}
            <Link
              to="/"
              className="mb-7 flex items-center justify-center gap-2 md:hidden"
            >
              <span className="rounded-full bg-green-100 p-2 text-green-800">
                <Leaf size={22} />
              </span>
              <span className="font-serif text-2xl font-bold text-stone-800">
                Clear Skin
              </span>
            </Link>

            {/* HEADING */}
            <div className="mb-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[3px] text-green-800">
                Join our community
              </p>

              <h2 className="font-serif text-3xl font-semibold text-stone-800 sm:text-4xl">
                Create account
              </h2>

              <p className="mt-3 text-sm leading-6 text-stone-500">
                Sign up to explore skincare made for your natural glow.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* FULL NAME */}
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-stone-700">
                  Full name
                </label>

                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    maxLength={80}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-stone-200 bg-[#fcfbf8] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-700">
                  Email address
                </label>

                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-stone-200 bg-[#fcfbf8] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-stone-700">
                  Phone number
                </label>

                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    maxLength={15}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-stone-200 bg-[#fcfbf8] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* ROLE */}
              <div>
                <label htmlFor="role" className="mb-2 block text-sm font-medium text-stone-700">
                  Register as
                </label>

                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />

                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full appearance-none rounded-xl border border-stone-200 bg-[#fcfbf8] py-3 pl-11 pr-10 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/10 disabled:opacity-60"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                    ▼
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-stone-500">
                  Admin access must be approved and assigned securely by the server.
                </p>
              </div>

              {/* PASSWORD */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-stone-700">
                  Password
                </label>

                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-stone-200 bg-[#fcfbf8] py-3 pl-11 pr-12 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-green-800"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-stone-700">
                  Confirm password
                </label>

                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Enter password again"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-stone-200 bg-[#fcfbf8] py-3 pl-11 pr-12 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-green-800"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* TERMS */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  disabled={loading}
                  className="mt-1 h-4 w-4 accent-green-800"
                />

                <label htmlFor="terms" className="text-xs leading-5 text-stone-500">
                  I agree to the{" "}
                  <span className="font-medium text-green-800">
                    Terms &amp; Conditions
                  </span>{" "}
                  and privacy policy.
                </label>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#304b39] py-3.5 text-sm font-semibold text-white shadow-md shadow-green-900/10 transition hover:bg-[#243b2c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN LINK */}
            <p className="mt-6 text-center text-sm text-stone-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-green-800 hover:underline">
                Login
              </Link>
            </p>

            {/* HOME LINK */}
            <div className="mt-5 text-center">
              <Link to="/" className="text-xs text-stone-400 transition hover:text-green-800">
                ← Back to home
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
