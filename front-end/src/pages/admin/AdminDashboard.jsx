
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
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  IndianRupee,
  Boxes,
  UserRound,
  FolderKanban,
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

  if (Array.isArray(response?.[key])) {
    return response[key];
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.[key])) {
    return response.data[key];
  }

  return [];
};

/* -------------------------------------------------
   STATUS HELPER
------------------------------------------------- */

const getOrderStatus = (order) => {
  return String(
    order?.orderStatus ||
      order?.status ||
      order?.order_status ||
      ""
  )
    .trim()
    .toLowerCase();
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
  if (!image) return "";

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

  /* -------------------------------------------------
     AUTH CHECK + FETCH DATA
  ------------------------------------------------- */

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

        /* ---------------------------------------------
           TOKEN / AUTH ERROR
        --------------------------------------------- */

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

        /* ---------------------------------------------
           READ JSON
        --------------------------------------------- */

        const results = await Promise.all(
          responses.map(async (response) => {
            try {
              return await response.json();
            } catch {
              return {};
            }
          })
        );

        /* ---------------------------------------------
           SET DATA
        --------------------------------------------- */

        setProducts(getArray(results[0], "products"));
        setCategories(getArray(results[1], "categories"));
        setUsers(getArray(results[2], "users"));
        setOrders(getArray(results[3], "orders"));

        /* ---------------------------------------------
           DEBUG ORDERS
           Browser console me exact status dikhega.
        --------------------------------------------- */

        console.table(
          getArray(results[3], "orders").map((order) => ({
            id: order?._id,
            orderStatus: order?.orderStatus,
            status: order?.status,
            totalAmount: order?.totalAmount,
          }))
        );
      } catch (err) {
        console.error("Admin dashboard error:", err);

        setError(
          err?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  /* -------------------------------------------------
     DASHBOARD CALCULATIONS
  ------------------------------------------------- */

  const totalRevenue = useMemo(() => {
    return orders
      .filter(
        (order) =>
          getOrderStatus(order) === "delivered"
      )
      .reduce((sum, order) => {
        const amount = Number(
          order?.totalAmount ??
            order?.total ??
            order?.amount ??
            0
        );

        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0);
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        getOrderStatus(order) === "delivered"
    );
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = getOrderStatus(order);

      return [
        "pending",
        "processing",
        "confirmed",
        "packed",
      ].includes(status);
    });
  }, [orders]);

  const cancelledOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = getOrderStatus(order);

      return (
        status === "cancelled" ||
        status === "canceled"
      );
    });
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          Number(product?.stock ?? 0) <= 5
      )
      .sort(
        (a, b) =>
          Number(a?.stock ?? 0) -
          Number(b?.stock ?? 0)
      )
      .slice(0, 5);
  }, [products]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0) -
          new Date(a?.createdAt || 0)
      )
      .slice(0, 5);
  }, [orders]);

  const deliveredPercentage = useMemo(() => {
    if (!orders.length) return 0;

    return Math.min(
      100,
      Math.round(
        (deliveredOrders.length / orders.length) * 100
      )
    );
  }, [orders.length, deliveredOrders.length]);

  /* -------------------------------------------------
     LOGOUT
  ------------------------------------------------- */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  /* -------------------------------------------------
     DATE FORMAT
  ------------------------------------------------- */

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

  /* -------------------------------------------------
     SIDEBAR
  ------------------------------------------------- */

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

  /* -------------------------------------------------
     SIDEBAR COMPONENT
  ------------------------------------------------- */

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
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

      {/* Menu */}
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

      {/* Logout */}
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

  /* -------------------------------------------------
     LOADING
  ------------------------------------------------- */

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

  /* -------------------------------------------------
     MAIN UI
  ------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#f8f7f1] text-[#273128]">
      {/* ---------------------------------------------
          DESKTOP SIDEBAR
      --------------------------------------------- */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#e7e5dc] bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* ---------------------------------------------
          MOBILE SIDEBAR
      --------------------------------------------- */}

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white lg:hidden">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-end px-4 pt-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-[#4f5a51] hover:bg-[#edf2e8]"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="flex-1">
                <SidebarContent />
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ---------------------------------------------
          CONTENT
      --------------------------------------------- */}

      <main className="min-h-screen lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-[#e7e5dc] bg-[#f8f7f1]/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-[#e2e5dd] bg-white p-2.5 text-[#315c40] lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
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
              className="hidden rounded-xl bg-[#315c40] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#264b32] sm:block"
            >
              View Store
            </Link>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Unable to load some dashboard data
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* -----------------------------------------
              STAT CARDS
          ----------------------------------------- */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Products */}
            <div className="rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
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
                Manage products
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Categories */}
            <div className="rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
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
                Manage categories
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Orders */}
            <div className="rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
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

            {/* Users */}
            <div className="rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
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
                View users
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* -----------------------------------------
              REVENUE + ORDER SUMMARY
          ----------------------------------------- */}

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Revenue */}
            <div className="xl:col-span-2 overflow-hidden rounded-2xl bg-[#315c40] p-6 text-white shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2 text-white/80">
                    <TrendingUp size={19} />

                    <span className="text-sm font-medium">
                      Delivered Orders Revenue
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <IndianRupee
                      size={30}
                      strokeWidth={2.2}
                    />

                    <h3 className="text-4xl font-bold tracking-tight sm:text-5xl">
                      {money(totalRevenue).replace(
                        "₹",
                        ""
                      )}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm text-white/70">
                    Calculated from delivered orders only
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <CheckCircle size={28} />
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/70">
                    Delivered Orders
                  </span>

                  <span className="font-semibold">
                    {deliveredOrders.length} /{" "}
                    {orders.length}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{
                      width: `${deliveredPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/60">
                    Delivered
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {deliveredOrders.length}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/60">
                    Pending
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {pendingOrders.length}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/60">
                    Cancelled
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {cancelledOrders.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="rounded-2xl border border-[#e6e6df] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#273128]">
                    Order Overview
                  </h3>

                  <p className="mt-1 text-sm text-[#7a817a]">
                    Current order status
                  </p>
                </div>

                <div className="rounded-xl bg-[#edf2e8] p-3 text-[#315c40]">
                  <Clock size={21} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6f776f]">
                    Total Orders
                  </span>

                  <span className="font-bold text-[#273128]">
                    {orders.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6f776f]">
                    Pending
                  </span>

                  <span className="font-bold text-yellow-600">
                    {pendingOrders.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6f776f]">
                    Delivered
                  </span>

                  <span className="font-bold text-green-600">
                    {deliveredOrders.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6f776f]">
                    Cancelled
                  </span>

                  <span className="font-bold text-red-600">
                    {cancelledOrders.length}
                  </span>
                </div>
              </div>

              <Link
                to="/admin/orders"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#edf2e8] px-4 py-3 text-sm font-semibold text-[#315c40] transition hover:bg-[#dfe9dc]"
              >
                Manage Orders
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* -----------------------------------------
              RECENT ORDERS + LOW STOCK
          ----------------------------------------- */}

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Recent Orders */}
            <div className="overflow-hidden rounded-2xl border border-[#e6e6df] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#ecece5] px-5 py-5 sm:px-6">
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
                  className="text-sm font-semibold text-[#315c40]"
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
                  {recentOrders.map((order) => {
                    const status =
                      getOrderStatus(order);

                    const customerName =
                      order?.user?.fullName ||
                      order?.user?.name ||
                      order?.shippingAddress
                        ?.fullName ||
                      "Customer";

                    return (
                      <div
                        key={order?._id}
                        className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-[#273128]">
                              #
                              {String(
                                order?._id || ""
                              ).slice(-8)}
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
                            {formatDate(
                              order?.createdAt
                            )}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-[#273128]">
                            {money(
                              order?.totalAmount ||
                                order?.total ||
                                order?.amount ||
                                0
                            )}
                          </p>

                          <p className="mt-1 text-xs text-[#858b85]">
                            {order?.items?.length ||
                              0}{" "}
                            item
                            {(order?.items?.length ||
                              0) !== 1
                              ? "s"
                              : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Low Stock */}
            <div className="overflow-hidden rounded-2xl border border-[#e6e6df] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#ecece5] px-5 py-5 sm:px-6">
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
                  <CheckCircle
                    size={38}
                    className="mx-auto text-green-500"
                  />

                  <p className="mt-3 text-sm font-medium text-[#737a73]">
                    All products have healthy stock
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#eeeeea]">
                  {lowStockProducts.map((product) => {
                    const image = getImageUrl(
                      product?.image
                    );

                    const stock = Number(
                      product?.stock || 0
                    );

                    return (
                      <div
                        key={product?._id}
                        className="flex items-center gap-4 px-5 py-4 sm:px-6"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f3f4ef]">
                          {image ? (
                            <img
                              src={image}
                              alt={product?.name || "Product"}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
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
                            {product?.name ||
                              "Unnamed Product"}
                          </p>

                          <p className="mt-1 text-xs text-[#7d847d]">
                            {money(
                              product?.price || 0
                            )}
                          </p>
                        </div>

                        <div className="text-right">
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
                  Manage Products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* -----------------------------------------
              QUICK ACTIONS
          ----------------------------------------- */}

          <div className="mt-6 rounded-2xl border border-[#e6e6df] bg-white p-5 shadow-sm sm:p-6">
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
                <Package
                  size={22}
                  className="text-[#315c40]"
                />

                <span className="mt-2 text-sm font-semibold text-[#4e584f]">
                  Products
                </span>
              </Link>

              <Link
                to="/admin/categories"
                className="flex flex-col items-center justify-center rounded-xl border border-[#e6e6df] p-4 text-center transition hover:border-[#315c40] hover:bg-[#edf2e8]"
              >
                <FolderTree
                  size={22}
                  className="text-[#315c40]"
                />

                <span className="mt-2 text-sm font-semibold text-[#4e584f]">
                  Categories
                </span>
              </Link>

              <Link
                to="/admin/orders"
                className="flex flex-col items-center justify-center rounded-xl border border-[#e6e6df] p-4 text-center transition hover:border-[#315c40] hover:bg-[#edf2e8]"
              >
                <ShoppingBag
                  size={22}
                  className="text-[#315c40]"
                />

                <span className="mt-2 text-sm font-semibold text-[#4e584f]">
                  Orders
                </span>
              </Link>

              <Link
                to="/admin/users"
                className="flex flex-col items-center justify-center rounded-xl border border-[#e6e6df] p-4 text-center transition hover:border-[#315c40] hover:bg-[#edf2e8]"
              >
                <Users
                  size={22}
                  className="text-[#315c40]"
                />

                <span className="mt-2 text-sm font-semibold text-[#4e584f]">
                  Users
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}