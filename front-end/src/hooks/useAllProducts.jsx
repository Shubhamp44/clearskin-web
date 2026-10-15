
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";



const useAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all products
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products/");

      const body = response.data;

      // API response ke different formats handle karna
      const productData = Array.isArray(body)
        ? body
        : body?.products ??
          body?.data?.products ??
          body?.data ??
          body?.results ??
          [];

      if (!Array.isArray(productData)) {
        throw new Error("Invalid products response format");
      }

      setProducts(productData);
    } catch (err) {
      console.error(
        "Fetch All Products Error:",
        err.response?.data || err.message
      );

      setProducts([]);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Products load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // API automatically call hogi
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return {
    products,
    loading,
    error,
    refetchProducts: fetchAllProducts,
  };
};

export default useAllProducts;
