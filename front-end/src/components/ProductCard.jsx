
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart } from "lucide-react";
import getImageUrl from "../utils/imageUtils";



export default function ProductCard({
  product,
  isWishlisted = false,
  onToggleWishlist,
  wishlistLoading = false,
  onAddToCart,
  addingToCart = false,
}) {
  const image = getImageUrl(product?.image);
  const outOfStock = Number(product?.stock) <= 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* PRODUCT IMAGE */}
      <div className="relative overflow-hidden bg-stone-100">
        <Link to={`/products/${product?._id}`} className="block">
          {image ? (
            <img
              src={image}
              alt={product?.name || "Skincare product"}
              loading="lazy"
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-60 md:h-64 lg:h-72"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-stone-400 sm:h-60 md:h-64 lg:h-72">
              No image
            </div>
          )}
        </Link>

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={wishlistLoading}
          onClick={() => onToggleWishlist?.(product)}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110 disabled:cursor-wait disabled:opacity-60 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
        >
          <Heart
            size={19}
            fill={isWishlisted ? "currentColor" : "none"}
            className={isWishlisted ? "text-rose-600" : "text-stone-700"}
          />
        </button>

        {/* STOCK STATUS */}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
            Out of Stock
          </span>
        )}
      </div>

      {/* PRODUCT DETAILS */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 lg:p-5">
        <div className="mb-1 flex items-center gap-1 sm:mb-2">
          <Star
            size={14}
            fill="currentColor"
            className="text-yellow-500"
          />
          <span className="text-xs text-stone-600 sm:text-sm">
            {product?.rating ?? 0}
          </span>
        </div>

        <Link to={`/products/${product?._id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-stone-800 transition hover:text-emerald-700 sm:text-base lg:text-lg">
            {product?.name || "Skincare Product"}
          </h3>
        </Link>

        {product?.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500 sm:text-sm">
            {product.description}
          </p>
        )}

        {/* PRICE AND CART */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="text-base font-bold text-emerald-800 sm:text-lg lg:text-xl">
            ₹{product?.price ?? 0}
          </p>

          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            disabled={outOfStock || addingToCart}
            aria-label={`Add ${product?.name || "product"} to cart`}
            title={
              outOfStock
                ? "Out of stock"
                : addingToCart
                  ? "Adding to cart..."
                  : "Add to cart"
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-400 sm:h-10 sm:w-10"
          >
            <ShoppingCart size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}
