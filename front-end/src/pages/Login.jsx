
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    loading,
    error,
    clearMessages,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearMessages();

    const result = await login({
      email: email.trim(),
      password,
    });

    if (!result.success) {
      toast.error("Something went wrong!");
      return;
    }
  toast.success("Login successful! Welcome to Clear Skin.");

    const user = result.user;

    // Redirect according to role
    if (user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate(location.state?.from?.pathname || "/", {
        replace: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT IMAGE */}
        <div className="hidden md:flex relative min-h-[420px] lg:min-h-[450px] items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=700&q=80"
            alt="Clear Skin skincare products"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/25" />

          <div className="relative z-10 text-white text-center px-6">
            <p className="text-xs sm:text-sm tracking-[3px] uppercase mb-3">
              Welcome to
            </p>

            <h1 className="text-3xl lg:text-4xl font-serif font-semibold mb-3">
              Clear Skin
            </h1>

            <p className="text-sm lg:text-base max-w-xs mx-auto leading-relaxed">
              Simple skincare. Natural confidence.
              Discover products made for your everyday glow.
            </p>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="flex items-center justify-center p-5 sm:p-8 md:p-7 lg:p-10">
          <div className="w-full max-w-sm">

            {/* LOGO */}
            <div className="text-center mb-6 sm:mb-7">
              <Link to="/">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3f3935]">
                  Clear Skin
                </h2>
              </Link>

              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Welcome back to your skincare journey
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#3f3935] mb-1.5"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-[#faf9f7] outline-none transition text-sm focus:border-[#8c7566] focus:ring-2 focus:ring-[#8c7566]/20"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#3f3935]"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm text-[#8c7566] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full px-3.5 py-2.5 sm:py-3 pr-16 rounded-lg border border-gray-200 bg-[#faf9f7] outline-none transition text-sm focus:border-[#8c7566] focus:ring-2 focus:ring-[#8c7566]/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-[#8c7566] font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#8c7566]"
                />

                <label
                  htmlFor="remember"
                  className="text-xs sm:text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 rounded-lg bg-[#3f3935] text-white text-sm sm:text-base font-medium hover:bg-[#574c45] transition duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* DIVIDER */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* REGISTER */}
            <p className="text-center text-xs sm:text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#8c7566] hover:underline"
              >
                Create Account
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
