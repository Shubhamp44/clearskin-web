import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";

dotenv.config();

const app = express();




app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));




connectDB();




app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products",productRoutes);


app.use("/api/categories", categoryRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Clear Skin API is running",
  });
});


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});