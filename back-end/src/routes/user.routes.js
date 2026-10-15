
import express from "express";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
} from "../controllers/user.controller.js";

import {
  protect,
  adminOnly,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Logged-in user's own profile
router.get("/profile", protect, getMyProfile);
router.put("/updateprofile", protect, updateMyProfile);

// Admin-only user management
router.get("/", protect, adminOnly, getUsers);
router.post("/", protect, adminOnly, createUser);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;


// import express from "express";

// import {
//   getUsers,
//   createUser,
//   updateUser,
//   deleteUser,
//   getMyProfile,
//   updateMyProfile,
// } from "../controllers/user.controller.js";

// import {
//   protect,
//   adminOnly,
// } from "../middleware/auth.middleware.js";

// const router = express.Router();

// // Admin-only user management
// router.get("/", protect, adminOnly, getUsers);
// router.post("/", protect, adminOnly, createUser);
// router.put("/:id", protect, updateUser);
// router.delete("/:id", protect, adminOnly, deleteUser);

// // Logged-in user's own profile
// router.get("/profile", protect, getMyProfile);
// router.put("/profile", protect, updateMyProfile);

// export default router;
