import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Token ko har request par read karo.
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const getId = (item) => {
    const product = item?.product || item?.productId || item;

    return String(
      product?._id ||
        product?.id ||
        (typeof item?.product === "string" ? item.product : "") ||
        (typeof item?.productId === "string" ? item.productId : "")
    );
  };

  const extractItems = (responseData) => {
    const data = responseData?.data ?? responseData;

    const items =
      data?.cart?.items ??
      data?.data?.cart?.items ??
      data?.items ??
      data?.data?.items ??
      data?.cart?.products ??
      data?.products ??
      data?.data?.products ??
      [];

    return Array.isArray(items) ? items : [];
  };

  // Fetch cart
  const fetchCart = useCallback(async () => {
    const config = getAuthConfig();

    if (!config) {
      setCartItems([]);
      setError("Please login to view your cart.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart", config);

      setCartItems(extractItems(response.data));
    } catch (err) {
      console.error("Fetch cart error:", err.response?.data || err);

      if (err.response?.status === 401) {
        setCartItems([]);
        setError("Your session is missing or expired. Please login again.");
      } else {
        setError(
          err.response?.data?.message || "Unable to load your cart."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add product
  const addToCart = async (product, quantity = 1) => {
    const config = getAuthConfig();

    if (!config) {
      setError("Please login to add products to your cart.");
      toast.error("Please login to add products to your cart.");
      return false;
    }

    const productId =
      typeof product === "string" ? product : product?._id || product?.id;

    if (!productId) {
      setError("Product not found.");
      toast.error("Product not found.");
      return false;
    }

    try {
      setAddingId(String(productId));
      setError("");
      setMessage("");

      const response = await api.post(
        "/cart/add",
        {
          productId,
          quantity,
        },
        config
      );

      const successMessage =
        response.data?.message || "Product added to cart.";

      setMessage(successMessage);

      // Toast
      toast.success("Product added to cart!");

      await fetchCart();

      window.dispatchEvent(new Event("cartUpdated"));

      return true;
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err);

      const errorMessage =
        err.response?.data?.message ||
        "Unable to add product to cart.";

      setError(errorMessage);

      // Toast
      toast.error(errorMessage);

      return false;
    } finally {
      setAddingId(null);
    }
  };

  // Update quantity
  const updateQuantity = async (item, quantity) => {
    const productId = getId(item);
    const config = getAuthConfig();

    if (!config || !productId || quantity < 1) return false;

    try {
      setUpdatingId(productId);
      setError("");
      setMessage("");

      // Backend route must accept productId and quantity.
      const response = await api.put(
        "/cart/update",
        {
          productId,
          quantity,
        },
        config
      );

      const successMessage =
        response.data?.message || "Cart updated.";

      setMessage(successMessage);

      // Toast
      toast.success("Cart updated!");

      await fetchCart();

      window.dispatchEvent(new Event("cartUpdated"));

      return true;
    } catch (err) {
      console.error("Update cart error:", err.response?.data || err);

      const errorMessage =
        err.response?.data?.message ||
        "Unable to update quantity. Check your backend route.";

      setError(errorMessage);

      // Toast
      toast.error(errorMessage);

      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  // Remove product
  const removeItem = async (productId) => {
    const config = getAuthConfig();

    if (!config || !productId) return false;

    try {
      setUpdatingId(String(productId));
      setError("");
      setMessage("");

      // Backend route must accept DELETE /cart/:productId.
      const response = await api.delete(
        `/cart/${productId}`,
        config
      );

      const successMessage =
        response.data?.message || "Product removed from cart.";

      setMessage(successMessage);

      // Toast
      toast.success("Product removed from cart.");

      await fetchCart();

      window.dispatchEvent(new Event("cartUpdated"));

      return true;
    } catch (err) {
      console.error(
        "Remove cart item error:",
        err.response?.data || err
      );

      const errorMessage =
        err.response?.data?.message ||
        "Unable to remove product. Check your backend route.";

      setError(errorMessage);

      // Toast
      toast.error(errorMessage);

      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchCart();

    const handleCartUpdated = () => fetchCart();

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdated
      );
    };
  }, [fetchCart]);

  return {
    cartItems,
    loading,
    addingId,
    updatingId,
    error,
    message,
    addToCart,
    fetchCart,
    updateQuantity,
    removeItem,
  };
};

export default useCart;