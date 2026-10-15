
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch single product
  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setError("Product ID not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/products/${productId}`
      );

      const data =
        response.data?.product ??
        response.data?.data ??
        response.data;

      if (!data || typeof data !== "object") {
        throw new Error("Invalid product response.");
      }

      setProduct(data);
    } catch (err) {
      console.error(
        "Fetch Product Error:",
        err.response?.data || err.message
      );

      setProduct(null);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Product load nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      if (!productId) {
        setProduct(null);
        setError("Product ID not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/products/${productId}`
        );

        const data =
          response.data?.product ??
          response.data?.data ??
          response.data;

        if (!data || typeof data !== "object") {
          throw new Error("Invalid product response.");
        }

        if (!cancelled) {
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Fetch Product Error:",
            err.response?.data || err.message
          );

          setProduct(null);
          setError(
            err.response?.data?.message ||
            err.message ||
            "Product load nahi ho paaya."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return {
    product,
    setProduct,
    loading,
    error,
    refetchProduct: fetchProduct,
  };
};

export default useProduct;
