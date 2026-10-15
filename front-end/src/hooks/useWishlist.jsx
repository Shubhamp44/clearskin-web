



import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const getToken = () => localStorage.getItem("token");

const getProduct = (item) => item?.product ?? item;

const getProductId = (item) => {
  const product = getProduct(item);

  const id =
    typeof product === "object" && product !== null
      ? product._id ?? product.id ?? product.productId
      : product;

  return id ? String(id) : "";
};

const extractProducts = (body) => {
  let items =
    body?.products ??
    body?.wishlist?.products ??
    body?.wishlist?.items ??
    body?.wishlist ??
    body?.items ??
    body?.data?.products ??
    body?.data?.wishlist?.products ??
    body?.data?.wishlist ??
    body?.data?.items ??
    body?.data ??
    [];

  if (!Array.isArray(items) && Array.isArray(items?.products)) {
    items = items.products;
  }

  return Array.isArray(items) ? items : [];
};

export default function useWishlist() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");

  // FETCH COMPLETE WISHLIST
  const fetchWishlist = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setProducts([]);
      setWishlistIds([]);
      setWishlistError("Please login to view your wishlist.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setWishlistError("");

      const response = await api.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Wishlist API response:", response.data);

      const items = extractProducts(response.data);

      setProducts(items);

      setWishlistIds([
        ...new Set(items.map(getProductId).filter(Boolean)),
      ]);
    } catch (error) {
      console.error(
        "Fetch Wishlist Error:",
        error.response?.data || error.message
      );

      setProducts([]);
      setWishlistIds([]);

      if (error.response?.status === 401) {
        setWishlistError("Session expired. Please login again.");
      } else {
        setWishlistError(
          error.response?.data?.message ||
            "Unable to load wishlist products."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // REFRESH WHEN WISHLIST CHANGES ELSEWHERE
  useEffect(() => {
    const handleWishlistUpdated = () => {
      fetchWishlist();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);

    return () => {
      window.removeEventListener(
        "wishlistUpdated",
        handleWishlistUpdated
      );
    };
  }, [fetchWishlist]);

  // ADD / REMOVE TOGGLE
  const toggleWishlist = useCallback(
    async (product) => {
      const productId = getProductId(product);

      if (!productId || wishlistLoadingIds.includes(productId)) {
        return false;
      }

      const token = getToken();

      if (!token) {
        setWishlistError("Please login to manage your wishlist.");
        navigate("/login");
        return false;
      }

      setWishlistLoadingIds((prev) =>
        prev.includes(productId) ? prev : [...prev, productId]
      );

      setWishlistError("");
      setWishlistMessage("");

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        if (wishlistIds.includes(productId)) {
          await api.delete(`/wishlist/${productId}`, config);

          setProducts((prev) =>
            prev.filter((item) => getProductId(item) !== productId)
          );

          setWishlistIds((prev) =>
            prev.filter((id) => id !== productId)
          );

          setWishlistMessage("Product removed from wishlist.");
        } else {
          const response = await api.post(
            "/wishlist/add",
            { productId },
            config
          );

          setWishlistIds((prev) =>
            prev.includes(productId) ? prev : [...prev, productId]
          );

          setWishlistMessage(
            response.data?.message || "Product added to wishlist!"
          );

          // Fetch complete product data from backend
          await fetchWishlist();
        }

        window.dispatchEvent(new Event("wishlistUpdated"));
        return true;
      } catch (error) {
        console.error(
          "Wishlist Update Error:",
          error.response?.data || error.message
        );

        setWishlistError(
          error.response?.data?.message ||
            "Wishlist update failed. Please try again."
        );

        return false;
      } finally {
        setWishlistLoadingIds((prev) =>
          prev.filter((id) => id !== productId)
        );
      }
    },
    [wishlistIds, wishlistLoadingIds, navigate, fetchWishlist]
  );

  // ADD TO WISHLIST
  const addToWishlist = useCallback(
    async (product) => {
      const productId = getProductId(product);

      if (!productId) return false;

      if (wishlistIds.includes(productId)) {
        setWishlistMessage("Product is already in your wishlist.");
        setWishlistError("");
        return true;
      }

      return toggleWishlist(product);
    },
    [wishlistIds, toggleWishlist]
  );

  // REMOVE FROM WISHLIST
  const removeFromWishlist = useCallback(
    async (product) => {
      const productId = getProductId(product);

      if (!productId || !wishlistIds.includes(productId)) {
        return false;
      }

      return toggleWishlist(product);
    },
    [wishlistIds, toggleWishlist]
  );

  // REMOVE BY PRODUCT ID — FOR WISHLIST PAGE
  const removeWishlistProduct = useCallback(
    async (productId) => {
      const product = products.find(
        (item) => getProductId(item) === String(productId)
      );

      if (!product) return false;

      return removeFromWishlist(product);
    },
    [products, removeFromWishlist]
  );

  // CHECK WISHLIST STATUS
  const isInWishlist = useCallback(
    (productId) => wishlistIds.includes(String(productId || "")),
    [wishlistIds]
  );

  return {
    products,
    loading,
    error: wishlistError,
    message: wishlistMessage,
    wishlistIds,
    wishlistLoadingIds,
    wishlistError,
    wishlistMessage,
    fetchWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    removeWishlistProduct,
    isInWishlist,
  };
}
