
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Leaf,
  Search,
  ShoppingCart,
  Heart,
  UserRound,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
  LoaderCircle,
  LogIn,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import useAllProducts from "../hooks/useAllProducts";
import useCategories from "../hooks/useCategories";
import getImageUrl from "../utils/imageUtils";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isDark, toggleTheme } = useTheme();
  const { products: fetchedProducts = [], loading: productsLoading } =
    useAllProducts();
  const {
    categories: fetchedCategories = [],
    loading: categoriesLoading,
  } = useCategories();

  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  const products = useMemo(() => {
    if (Array.isArray(fetchedProducts)) return fetchedProducts;
    if (Array.isArray(fetchedProducts?.products)) {
      return fetchedProducts.products;
    }
    if (Array.isArray(fetchedProducts?.data?.products)) {
      return fetchedProducts.data.products;
    }
    if (Array.isArray(fetchedProducts?.data)) {
      return fetchedProducts.data;
    }
    return [];
  }, [fetchedProducts]);

  const categories = useMemo(() => {
    if (Array.isArray(fetchedCategories)) return fetchedCategories;
    if (Array.isArray(fetchedCategories?.categories)) {
      return fetchedCategories.categories;
    }
    if (Array.isArray(fetchedCategories?.data?.categories)) {
      return fetchedCategories.data.categories;
    }
    if (Array.isArray(fetchedCategories?.data)) {
      return fetchedCategories.data;
    }
    return [];
  }, [fetchedCategories]);

  const getProductName = (product) =>
    String(
      product?.name || product?.title || product?.productName || ""
    ).trim();

  const getCategoryName = (category) =>
    String(category?.name || category?.title || "").trim();

  const query = search.trim().toLowerCase();

  const matchingProducts = useMemo(() => {
    if (!query) return [];

    return products
      .filter((product) => getProductName(product).toLowerCase().includes(query))
      .slice(0, 6);
  }, [products, query]);

  const matchingCategories = useMemo(() => {
    if (!query) return [];

    return categories
      .filter((category) =>
        getCategoryName(category).toLowerCase().includes(query)
      )
      .slice(0, 4);
  }, [categories, query]);

  useEffect(() => {
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const openProduct = (product) => {
    const id = product?._id || product?.id;

    if (id) {
      navigate(`/products/${id}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(getProductName(product))}`);
    }

    setShowSuggestions(false);
    setSearch("");
  };

  const openCategory = (category) => {
    const categoryId = category?._id || category?.id;
    const categoryName = getCategoryName(category);

    navigate(
      `/products?category=${encodeURIComponent(categoryId || categoryName)}`
    );

    setShowSuggestions(false);
    setSearch("");
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();
    if (!value) return;

    const normalized = value.toLowerCase();

    const productMatch = products.find(
      (product) => getProductName(product).toLowerCase() === normalized
    );

    const partialProductMatch = products.find((product) =>
      getProductName(product).toLowerCase().includes(normalized)
    );

    const matchedProduct = productMatch || partialProductMatch;

    if (matchedProduct) {
      openProduct(matchedProduct);
      return;
    }

    const matchedCategory = categories.find(
      (category) => getCategoryName(category).toLowerCase() === normalized
    );

    if (matchedCategory) {
      openCategory(matchedCategory);
      return;
    }

    navigate(`/products?search=${encodeURIComponent(value)}`);
    setShowSuggestions(false);
    setSearch("");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/products" },
    { name: "Categories", path: "/categories" },
    { name: "About Us", path: "/about" },
  ];

  const surface = isDark
    ? "bg-[#30352B] text-[#F5F0E6]"
    : "bg-green-100 text-gray-800";

  const borderColor = isDark ? "border-[#4A5142]" : "border-green-200";

  const hoverColor = isDark
    ? "hover:bg-[#424938]"
    : "hover:bg-green-200/70";

  const searchSurface = isDark
    ? "border-[#59604F] bg-[#252A22] text-[#F5F0E6]"
    : "border-green-200 bg-white text-gray-800";

  const linkClass = (path) =>
    `rounded-full px-3 py-2 text-sm font-medium transition ${
      location.pathname === path
        ? isDark
          ? "bg-[#424938] text-white"
          : "bg-white/80 text-green-800"
        : isDark
          ? "text-[#E5E7DB] hover:bg-[#424938]"
          : "text-gray-700 hover:bg-white/70 hover:text-green-800"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b ${borderColor} ${surface} shadow-sm`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Navbar */}
        <div className="flex min-h-[76px] items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2"
            aria-label="Clear Skin home"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full ${
                isDark
                  ? "bg-[#48523F] text-[#E4EACD]"
                  : "bg-green-700 text-white"
              }`}
            >
              <Leaf size={25} />
            </span>

            <span className="leading-tight">
              <span className="block text-xl font-bold tracking-tight">
                Clear Skin
              </span>
              <span
                className={`text-[10px] tracking-[1.5px] ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                NATURALLY BEAUTIFUL
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={linkClass(link.path)}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Search */}
          <div className="hidden min-w-0 flex-1 md:block md:max-w-sm lg:max-w-md">
            <div className="relative">
              <form
                onSubmit={handleSearch}
                className={`flex items-center gap-2 rounded-full border px-4 py-2.5 ${searchSurface}`}
              >
                <Search size={18} className="shrink-0 opacity-60" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search skincare products..."
                  aria-label="Search products and categories"
                  className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:opacity-60"
                />

                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearch("");
                      setShowSuggestions(false);
                    }}
                    className="opacity-60 transition hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>

              {showSuggestions && query && (
                <div
                  className={`absolute left-0 right-0 top-full z-[60] mt-2 max-h-[420px] overflow-y-auto rounded-2xl border p-2 shadow-xl ${searchSurface}`}
                >
                  {productsLoading || categoriesLoading ? (
                    <div className="flex items-center justify-center gap-2 p-5 text-sm">
                      <LoaderCircle size={18} className="animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    <>
                      {matchingProducts.length > 0 && (
                        <div className="p-1">
                          <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider opacity-60">
                            Products
                          </p>

                          {matchingProducts.map((product, index) => {
                            const productName = getProductName(product);
                            const image =
                              product?.image ||
                              product?.imageUrl ||
                              product?.img;

                            return (
                              <button
                                key={product._id || product.id || `${productName}-${index}`}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => openProduct(product)}
                                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${hoverColor}`}
                              >
                                <img
                                  src={getImageUrl(image)}
                                  alt={productName}
                                  className="h-12 w-12 shrink-0 rounded-lg bg-white object-cover"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />

                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium">
                                    {productName || "Unnamed product"}
                                  </span>

                                  {product.price != null && (
                                    <span className="mt-1 block text-xs opacity-70">
                                      ₹{product.price}
                                    </span>
                                  )}
                                </span>

                                <ArrowRight
                                  size={16}
                                  className="shrink-0 opacity-50"
                                />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {matchingCategories.length > 0 && (
                        <div
                          className={`border-t ${borderColor} p-1 ${
                            matchingProducts.length ? "mt-1" : ""
                          }`}
                        >
                          <p className="px-2 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider opacity-60">
                            Categories
                          </p>

                          {matchingCategories.map((category, index) => (
                            <button
                              key={category._id || category.id || `${getCategoryName(category)}-${index}`}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => openCategory(category)}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${hoverColor}`}
                            >
                              <span>{getCategoryName(category)}</span>
                              <ArrowRight size={15} className="opacity-50" />
                            </button>
                          ))}
                        </div>
                      )}

                      {matchingProducts.length === 0 &&
                        matchingCategories.length === 0 && (
                          <div className="p-5 text-center">
                            <p className="text-sm opacity-70">
                              No products or categories found.
                            </p>
                            <button
                              type="button"
                              onClick={handleSearch}
                              className="mt-2 text-sm font-semibold text-green-600 hover:underline"
                            >
                              Search all products
                            </button>
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Light mode" : "Dark mode"}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${hoverColor}`}
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              title="Wishlist"
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${hoverColor}`}
            >
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Shopping cart"
              title="Shopping cart"
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${hoverColor}`}
            >
              <ShoppingCart size={20} />
            </Link>

            {/* Profile / Login */}
            <Link
              to={token ? "/profile" : "/login"}
              aria-label={token ? "Profile" : "Login"}
              title={token ? "Profile" : "Login"}
              className={`hidden h-10 w-10 items-center justify-center rounded-full transition sm:flex ${hoverColor}`}
            >
              {token ? <UserRound size={20} /> : <LogIn size={20} />}
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition md:hidden ${hoverColor}`}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="relative pb-3 md:hidden">
          <form
            onSubmit={handleSearch}
            className={`flex items-center gap-2 rounded-full border px-4 py-2.5 ${searchSurface}`}
          >
            <Search size={18} className="shrink-0 opacity-60" />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search skincare products..."
              aria-label="Search products and categories"
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:opacity-60"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  setShowSuggestions(false);
                }}
                className="opacity-60"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {showSuggestions && query && (
            <div
              className={`absolute left-0 right-0 top-full z-[60] mt-1 max-h-[360px] overflow-y-auto rounded-2xl border p-2 shadow-xl ${searchSurface}`}
            >
              {productsLoading || categoriesLoading ? (
                <div className="flex items-center justify-center gap-2 p-4 text-sm">
                  <LoaderCircle size={18} className="animate-spin" />
                  Searching...
                </div>
              ) : (
                <>
                  {matchingProducts.map((product, index) => (
                    <button
                      key={product._id || product.id || `${getProductName(product)}-${index}`}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => openProduct(product)}
                      className={`flex w-full items-center gap-3 rounded-xl p-2 text-left ${hoverColor}`}
                    >
                      <img
                        src={getImageUrl(
                          product.image || product.imageUrl || product.img
                        )}
                        alt={getProductName(product)}
                        className="h-11 w-11 shrink-0 rounded-lg bg-white object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {getProductName(product)}
                        </span>
                        {product.price != null && (
                          <span className="text-xs opacity-70">
                            ₹{product.price}
                          </span>
                        )}
                      </span>
                      <ArrowRight size={15} className="opacity-50" />
                    </button>
                  ))}

                  {matchingCategories.map((category, index) => (
                    <button
                      key={category._id || category.id || `${getCategoryName(category)}-${index}`}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => openCategory(category)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${hoverColor}`}
                    >
                      <span>{getCategoryName(category)}</span>
                      <ArrowRight size={15} className="opacity-50" />
                    </button>
                  ))}

                  {matchingProducts.length === 0 &&
                    matchingCategories.length === 0 && (
                      <p className="p-4 text-center text-sm opacity-70">
                        No products or categories found.
                      </p>
                    )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className={`border-t ${borderColor} py-3 md:hidden`}>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={linkClass(link.path)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <Link
                to={token ? "/profile" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${hoverColor}`}
              >
                {token ? "My Profile" : "Login / Register"}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
