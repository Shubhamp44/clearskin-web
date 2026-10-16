
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Menu,
  X,
  LogOut,
  AlertTriangle,
  ArrowRight,
  Boxes,
  UserRound,
  FolderKanban,
  IndianRupee,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const money = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const getArray = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.[key])) {
    return response.data[key];
  }
  return [];
};

const getOrderStatus = (order) =>
  String(
    order?.orderStatus ||
      order?.status ||
      order?.order_status ||
      ""
  )
    .trim()
    .toLowerCase();

const getOrderAmount = (order) => {
  const amount = Number(
    order?.totalAmount ??
      order?.total ??
      order?.amount ??
      0
  );

  return Number.isFinite(amount) ? amount : 0;
};

const formatStatus = (status = "") => {
  if (!status) return "Pending";

  return status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusClasses = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "delivered") {
    return "bg-green-100 text-green-700";
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    normalized === "shipped" ||
    normalized === "out_for_delivery"
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    normalized === "confirmed" ||
    normalized === "processing"
  ) {
    return "bg-purple-100 text-purple-700";
  }

  return "bg-yellow-100 text-yellow-700";
};

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  const baseUrl = API.replace(/\/api\/?$/, "");

  return `${baseUrl}/${image.replace(/^\/+/, "")}`;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // AUTH CHECK + FETCH DASHBOARD DATA
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      navigate("/login", { replace: true });
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      return;
    }

    if (user?.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const endpoints = [
          `${API}/products`,
          `${API}/categories`,
          `${API}/users`,
          `${API}/orders`,
        ];

        const responses = await Promise.all(
          endpoints.map((url) =>
            fetch(url, {
              method: "GET",
              headers,
            })
          )
        );

        if (
          responses.some(
            (response) =>
              response.status === 401 ||
              response.status === 403
          )
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        const results = await Promise.all(
          responses.map(async (response) => {
            try {
              return await response.json();
            } catch {
              return {};
            }
          })
        );

        if (cancelled) return;

        if (responses.some((response) => !response.ok)) {
          setError(
            "Some dashboard data could not be loaded. Please refresh the page."
          );
        }

        setProducts(getArray(results[0], "products"));
        setCategories(getArray(results[1], "categories"));
        setUsers(getArray(results[2], "users"));
        setOrders(getArray(results[3], "orders"));
      } catch (err) {
        if (!cancelled) {
          console.error("Admin dashboard error:", err);
          setError(
            err?.message || "Failed to load dashboard data."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // PENDING ORDERS
  const pendingOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["pending", "processing", "confirmed", "packed"].includes(
          getOrderStatus(order)
        )
      ),
    [orders]
  );

  // ONLY TOTAL REVENUE CALCULATION
  const revenueStats = useMemo(() => {
    const validOrders = orders.filter(
      (order) =>
        !["cancelled", "canceled"].includes(
          getOrderStatus(order)
        )
    );

    const totalRevenue = validOrders.reduce(
      (sum, order) => sum + getOrderAmount(order),
      0
    );

    return { totalRevenue };
  }, [orders]);

  // LOW STOCK PRODUCTS
  const lowStockProducts = useMemo(
    () =>
      products
        .filter((product) => Number(product?.stock ?? 0) <= 5)
        .sort(
          (a, b) =>
            Number(a?.stock ?? 0) - Number(b?.stock ?? 0)
        )
        .slice(0, 5),
    [products]
  );

  // RECENT ORDERS
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b?.createdAt || 0) -
            new Date(a?.createdAt || 0)
        )
        .slice(0, 5),
    [orders]
  );

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // SIDEBAR MENU
  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
      active: true,
    },
    {
      name: "Products",
      icon: Package,
      path: "/admin/products",
    },
    {
      name: "Categories",
      icon: FolderTree,
      path: "/admin/categories",
    },
    {
      name: "Orders",
      icon: ShoppingBag,
      path: "/admin/orders",
    },
    {
      name: "Users",
      icon: Users,
      path: "/admin/users",
    },
  ];

  // SIDEBAR CONTENT
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#e7e5dc] px-6 py-6">
        <Link
          to="/"
          className="block"
          onClick={() => setMobileOpen(false)}
        >
          <h1 className="text-2xl font-bold tracking-tight text-[#315c40]">
            Clear Skin
          </h1>
          <p className="mt-1 text-xs font-medium text-[#7b8178]">
            Naturally Beautiful
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                item.active
                  ? "bg-[#315c40] text-white shadow-sm"
                  : "text-[#5d665d] hover:bg-[#edf2e8] hover:text-[#315c40]"
              }`}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#e7e5dc] p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </div>
  );

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f1]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dce5d9] border-t-[#315c40]" />
          <p className="mt-4 text-sm font-medium text-[#697169]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#f8f7f1] text-[#273128]">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#e7e5dc] bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 cursor-default bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white lg:hidden">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-end px-4 pt-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-[#4f5a51] hover:bg-[#edf2e8]"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="min-h-0 flex-1">
                <SidebarContent />
              </div>
            </div>
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="min-h-screen min-w-0 lg:ml-64">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-[#e7e5dc] bg-[#f8f7f1]/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="shrink-0 rounded-xl border border-[#e2e5dd] bg-white p-2.5 text-[#315c40] lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={21} />
              </button>

              <div className="min-w-0">
                <h2 className="text-xl font-bold text-[#263229] sm:text-2xl">
                  Admin Dashboard
                </h2>
                <p className="mt-0.5 hidden text-sm text-[#7a817a] sm:block">
                  Manage your Clear Skin store
                </p>
              </div>
            </div>

            <Link
              to="/"
              className="shrink-0 rounded-xl bg-green-800 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#264b32] sm:px-4 sm:text-sm"
            >
              View Store
            </Link>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* ERROR */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">
                  Unable to load some dashboard data
                </p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* GENERAL STAT CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* PRODUCTS */}
            <div className="rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#7a817a]">
                    Total Products
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-[#273128]">
                    {products.length}
                  </h3>
                </div>
                <div className="rounded-xl bg-[#edf2e8] p-3 text-[#315c40]">
                  <Boxes size={22} />
                </div>
              </div>
              <Link
                to="/admin/products"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#315c40]"
              >
                Manage products <ArrowRight size={15} />
              </Link>
            </div>

            {/* CATEGORIES */}
            <div className="rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#7a817a]">
                    Categories
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-[#273128]">
                    {categories.length}
                  </h3>
                </div>
                <div className="rounded-xl bg-[#edf2e8] p-3 text-[#315c40]">
                  <FolderKanban size={22} />
                </div>
              </div>
              <Link
                to="/admin/categories"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#315c40]"
              >
                Manage categories <ArrowRight size={15} />
              </Link>
            </div>

            {/* ORDERS */}
            <div className="rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#7a817a]">
                    Total Orders
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-[#273128]">
                    {orders.length}
                  </h3>
                </div>
                <div className="rounded-xl bg-[#edf2e8] p-3 text-[#315c40]">
                  <ShoppingBag size={22} />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-[#7a817a]">
                {pendingOrders.length} pending
              </p>
            </div>

            {/* USERS */}
            <div className="rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#7a817a]">
                    Total Users
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-[#273128]">
                    {users.length}
                  </h3>
                </div>
                <div className="rounded-xl bg-[#edf2e8] p-3 text-[#315c40]">
                  <UserRound size={22} />
                </div>
              </div>
              <Link
                to="/admin/users"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#315c40]"
              >
                View users <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* REVENUE OVERVIEW: ONLY TOTAL REVENUE */}
          <section className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#273128]">
                Revenue Overview
              </h3>
              <p className="mt-1 text-sm text-[#7a817a]">
                Total revenue from your orders
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#7a817a]">
                      Total Revenue
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-[#273128]">
                      {money(revenueStats.totalRevenue)}
                    </h3>
                  </div>

                  <div className="rounded-xl bg-[#edf2e8] p-3 text-[#315c40]">
                    <IndianRupee size={22} />
                  </div>
                </div>

                <p className="mt-4 text-xs text-[#7a817a]">
                  Excluding cancelled orders
                </p>
              </div>
            </div>
          </section>

          {/* RECENT ORDERS + LOW STOCK */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* RECENT ORDERS */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e6e6df] bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#ecece5] px-5 py-5 sm:px-6">
                <div>
                  <h3 className="font-bold text-[#273128]">
                    Recent Orders
                  </h3>
                  <p className="mt-1 text-sm text-[#7a817a]">
                    Latest customer orders
                  </p>
                </div>
                <Link
                  to="/admin/orders"
                  className="shrink-0 text-sm font-semibold text-[#315c40]"
                >
                  View All
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <ShoppingBag
                    size={38}
                    className="mx-auto text-[#b8beb7]"
                  />
                  <p className="mt-3 text-sm font-medium text-[#737a73]">
                    No orders found
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#eeeeea]">
                  {recentOrders.map((order, index) => {
                    const status = getOrderStatus(order);

                    const customerName =
                      order?.user?.fullName ||
                      order?.user?.name ||
                      order?.shippingAddress?.fullName ||
                      "Customer";

                    const itemCount = Array.isArray(order?.items)
                      ? order.items.reduce(
                          (sum, item) =>
                            sum + Number(item?.quantity || 1),
                          0
                        )
                      : 0;

                    return (
                      <div
                        key={order?._id || index}
                        className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-[#273128]">
                              #{String(order?._id || "").slice(-8)}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                                status
                              )}`}
                            >
                              {formatStatus(status)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-[#737a73]">
                            {customerName}
                          </p>
                          <p className="mt-1 text-xs text-[#999f99]">
                            {formatDate(order?.createdAt)}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-[#273128]">
                            {money(getOrderAmount(order))}
                          </p>
                          <p className="mt-1 text-xs text-[#858b85]">
                            {itemCount} item
                            {itemCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* LOW STOCK PRODUCTS */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e6e6df] bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#ecece5] px-5 py-5 sm:px-6">
                <div>
                  <h3 className="font-bold text-[#273128]">
                    Low Stock Products
                  </h3>
                  <p className="mt-1 text-sm text-[#7a817a]">
                    Products with 5 or fewer items
                  </p>
                </div>
                <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                  <AlertTriangle size={20} />
                </div>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                    <Package size={25} className="text-green-600" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#737a73]">
                    All products have healthy stock
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#eeeeea]">
                  {lowStockProducts.map((product, index) => {
                    const image = getImageUrl(product?.image);
                    const stock = Number(product?.stock ?? 0);

                    return (
                      <div
                        key={product?._id || index}
                        className="flex items-center gap-4 px-5 py-4 sm:px-6"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f3f4ef]">
                          {image ? (
                            <img
                              src={image}
                              alt={product?.name || "Product"}
                              loading="lazy"
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#a0a69f]">
                              <Package size={21} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#273128]">
                            {product?.name || "Unnamed Product"}
                          </p>
                          <p className="mt-1 text-xs text-[#7d847d]">
                            {money(product?.price || 0)}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={`text-sm font-bold ${
                              stock === 0
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            {stock}
                          </p>
                          <p className="text-xs text-[#8b918b]">
                            left
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-[#ecece5] px-5 py-4 sm:px-6">
                <Link
                  to="/admin/products"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#edf2e8] px-4 py-3 text-sm font-semibold text-[#315c40] transition hover:bg-[#dfe9dc]"
                >
                  Manage Products <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </div>

          {/* QUICK ACTIONS */}
          <section className="mt-6 rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h3 className="font-bold text-[#273128]">
                Quick Actions
              </h3>
              <p className="mt-1 text-sm text-[#7a817a]">
                Quickly manage your store
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Link
                to="/admin/products"
                className="flex flex-col items-center justify-center rounded-xl border border-[#e6e6df] p-4 text-center transition hover:border-[#315c40] hover:bg-[#edf2e8]"
              >
                <Package size={22} className="text-[#315c40]" />
                <span className="mt-2 text-sm font-semibold text-[#4e584f]">
                  Products
                </span>
              </Link>

              <Link
                to="/admin/categories"
                className="flex flex-col items-center justify-center rounded-xl border border-[#e6e6df] p-4 text-center transition hover:border-[#315c40] hover:bg-[#edf2e8]"
              >
                <FolderTree size={22} className="text-[#315c40]" />
                <span className="mt-2 text-sm font-semibold text-[#4e584f]">
                  Categories
                </span>
              </Link>

              <Link
                to="/admin/orders"
                className="flex flex-col items-center justify-center rounded-xl border border-[#e6e6df] p-4 text-center transition hover:border-[#315c40] hover:bg-[#edf2e8]"
              >
                <ShoppingBag size={22} className="text-[#315c40]" />
                <span className="mt-2 text-sm font-semibold text-[#4e584f]">
                  Orders
                </span>
              </Link>

              <Link
                to="/admin/users"
                className="flex flex-col items-center justify-center rounded-xl border border-[#e6e6df] p-4 text-center transition hover:border-[#315c40] hover:bg-[#edf2e8]"
              >
                <Users size={22} className="text-[#315c40]" />
                <span className="mt-2 text-sm font-semibold text-[#4e584f]">
                  Users
                </span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
