
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  X,
  LoaderCircle,
  IndianRupee,
} from "lucide-react";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

const STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const getArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getCustomerName = (order) => {
  const user = order.user;

  if (user && typeof user === "object") {
    return user.fullName || user.name || user.email || "Customer";
  }

  return order.shippingAddress?.fullName ||
    order.shippingAddress?.name ||
    order.customerName ||
    "Customer";
};

const getAmount = (order) =>
  Number(order.totalAmount ?? order.total ?? order.grandTotal ?? 0);

const getOrderDate = (order) => {
  const date = order.createdAt || order.orderDate;

  if (!date) return "—";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const getStatus = (status) => {
  const normalized = String(status || "Pending").toLowerCase();

  if (normalized === "confirmed") {
    return "bg-blue-50 text-blue-700";
  }

  if (normalized === "shipped") {
    return "bg-purple-50 text-purple-700";
  }

  if (normalized === "delivered") {
    return "bg-green-100 text-green-800";
  }

  if (normalized === "cancelled") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-800";
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    "Content-Type": "application/json",
  });

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/orders`, {
        headers: headers(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Orders load nahi ho paye.");
      }

      setOrders(getArray(data));
    } catch (err) {
      setError(err.message || "Orders fetch karne mein problem hui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customer = getCustomerName(order);
      const id = order._id || "";
      const email =
        typeof order.user === "object" ? order.user?.email || "" : "";

      const matchesSearch = `${customer} ${email} ${id}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        String(order.status || "Pending").toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const pendingCount = orders.filter(
    (order) => (order.status || "Pending").toLowerCase() === "pending"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status?.toLowerCase() === "delivered"
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status?.toLowerCase() === "cancelled"
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status?.toLowerCase() === "delivered")
    .reduce((total, order) => total + getAmount(order), 0);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/orders/${orderId}/status`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order status update nahi hua.");
      }

      const updatedOrder = data.order || data.data;

      setOrders((previous) =>
        previous.map((order) =>
          order._id === orderId
            ? { ...order, ...(updatedOrder || {}), status: newStatus }
            : order
        )
      );

      setSelectedOrder((previous) =>
        previous?._id === orderId
          ? { ...previous, ...(updatedOrder || {}), status: newStatus }
          : previous
      );

      setMessage(`Order status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.message || "Status update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "Address not available";

    if (typeof address === "string") return address;

    return [
      address.fullName || address.name,
      address.phone,
      address.addressLine1 || address.address,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode || address.pincode || address.zipCode,
    ]
      .filter(Boolean)
      .join(", ") || "Address not available";
  };

  const orderItems = (order) => {
    if (Array.isArray(order.items)) return order.items;
    if (Array.isArray(order.products)) return order.products;
    return [];
  };

  return (
    <div className="min-h-screen bg-[#f7f8f2] px-4 py-6 text-[#243b2d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#245238] hover:bg-green-50"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#245238] hover:bg-green-50 disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Refresh Orders
          </button>
        </div>

        {/* Header */}
        <section className="mb-6 rounded-2xl bg-[#163d2a] p-6 text-white shadow-lg sm:p-7">
          <p className="text-sm font-semibold  text-yellow-100">
            Store operations
          </p>

          <h1 className="mt-2 text-2xl font-extrabold  text-yellow-100 sm:text-3xl">
            Order Management 📦
          </h1>

          <p className="mt-2 text-sm leading-6  text-yellow-100">
            Track customer orders, manage deliveries and update order status.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-white/20 bg-[#245238] p-4">
              <ShoppingBag size={22} />
              <p className="mt-3 text-sm font-semibold text-white">
                Total Orders
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {loading ? "—" : orders.length}
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-[#245238] p-4">
              <Clock size={22} />
              <p className="mt-3 text-sm font-semibold text-white">
                Pending Orders
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {loading ? "—" : pendingCount}
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-[#245238] p-4">
              <CheckCircle size={22} />
              <p className="mt-3 text-sm font-semibold text-white">
                Delivered
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {loading ? "—" : deliveredCount}
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-[#245238] p-4">
              <IndianRupee size={22} />
              <p className="mt-3 text-sm font-semibold text-white">
                Delivered Revenue
              </p>
              <p className="mt-1 text-xl font-extrabold">
                {loading
                  ? "—"
                  : `₹${totalRevenue.toLocaleString("en-IN")}`}
              </p>
            </div>
          </div>
        </section>

        {/* Messages */}
        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Search and filters */}
        <section className="mb-6 rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#163d2a]">
                All Customer Orders
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Search orders and manage delivery status.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer or order ID"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 sm:w-72"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
              >
                <option value="All">All Statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Orders table */}
        <section className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-[#245238]">
              <LoaderCircle className="animate-spin" size={25} />
              <span className="font-medium">Loading orders...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <ShoppingBag
                size={40}
                className="mx-auto mb-3 text-green-800"
              />
              <h3 className="text-lg font-bold text-[#163d2a]">
                No orders found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try another search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-[#edf3e9] text-xs uppercase tracking-wide text-[#245238]">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Update Status</th>
                    <th className="px-5 py-4">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-green-50/50">
                      <td className="px-5 py-4">
                        <span className="font-bold text-[#163d2a]">
                          #{String(order._id || "").slice(-8).toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {getCustomerName(order)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {typeof order.user === "object"
                            ? order.user?.email || ""
                            : ""}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {getOrderDate(order)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-bold text-[#163d2a]">
                        ₹{getAmount(order).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${getStatus(order.status)}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={order.status || "Pending"}
                          disabled={updatingId === order._id}
                          onChange={(e) =>
                            updateStatus(order._id, e.target.value)
                          }
                          className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-semibold outline-none focus:border-green-700 disabled:opacity-60"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        {updatingId === order._id && (
                          <LoaderCircle
                            size={14}
                            className="ml-2 inline animate-spin"
                          />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#e9f0e6] px-3 py-2 font-bold text-[#245238] hover:bg-green-200"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-4 text-right text-xs text-gray-500">
          Cancelled orders: {cancelledCount}
        </p>

        {/* Order details modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Order details
                  </p>
                  <h2 className="mt-1 break-all text-xl font-extrabold text-[#163d2a]">
                    #{selectedOrder._id}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Placed on {getOrderDate(selectedOrder)}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  aria-label="Close order details"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mb-5 rounded-xl bg-[#edf3e9] p-4">
                <p className="text-sm text-gray-600">Customer</p>
                <p className="mt-1 font-bold text-[#163d2a]">
                  {getCustomerName(selectedOrder)}
                </p>
                {typeof selectedOrder.user === "object" &&
                  selectedOrder.user?.email && (
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedOrder.user.email}
                    </p>
                  )}
              </div>

              <div className="mb-5">
                <h3 className="mb-2 font-bold text-[#163d2a]">
                  Shipping Address
                </h3>
                <p className="rounded-xl border border-gray-200 p-4 text-sm leading-6 text-gray-600">
                  {formatAddress(selectedOrder.shippingAddress)}
                </p>
              </div>

              {selectedOrder.billingAddress && (
                <div className="mb-5">
                  <h3 className="mb-2 font-bold text-[#163d2a]">
                    Billing Address
                  </h3>
                  <p className="rounded-xl border border-gray-200 p-4 text-sm leading-6 text-gray-600">
                    {formatAddress(selectedOrder.billingAddress)}
                  </p>
                </div>
              )}

              <div className="mb-5">
                <h3 className="mb-3 font-bold text-[#163d2a]">
                  Ordered Products
                </h3>

                {orderItems(selectedOrder).length === 0 ? (
                  <p className="rounded-xl border border-gray-200 p-4 text-sm text-gray-500">
                    Product items are not available in this order response.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orderItems(selectedOrder).map((item, index) => {
                      const product =
                        item.product && typeof item.product === "object"
                          ? item.product
                          : item;

                      const name =
                        product.name ||
                        product.title ||
                        item.name ||
                        "Product";

                      const quantity = Number(item.quantity || 1);
                      const price = Number(
                        item.price ?? product.price ?? 0
                      );

                      return (
                        <div
                          key={item._id || product._id || index}
                          className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-3"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">
                              {name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Quantity: {quantity}
                            </p>
                          </div>

                          <p className="whitespace-nowrap font-bold text-[#163d2a]">
                            ₹{(price * quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mb-5 rounded-xl bg-[#163d2a] p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">Order Total</span>
                  <span className="text-xl font-extrabold">
                    ₹{getAmount(selectedOrder).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-green-100">
                  Payment: {selectedOrder.paymentMethod || "Cash on Delivery"}
                </p>
                <p className="mt-1 text-sm text-green-100">
                  Status: {selectedOrder.status || "Pending"}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#163d2a]">
                  Update Order Status
                </label>

                <select
                  value={selectedOrder.status || "Pending"}
                  disabled={updatingId === selectedOrder._id}
                  onChange={(e) =>
                    updateStatus(selectedOrder._id, e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-700 disabled:opacity-60"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="mt-5 w-full rounded-xl bg-[#163d2a] px-4 py-3 font-bold text-white hover:bg-[#245238]"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
