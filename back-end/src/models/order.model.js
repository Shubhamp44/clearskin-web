
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    billingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },


    couponCode: {
  type: String,
  default: null,
},

discount: {
  type: Number,
  default: 0,
  min: 0,
},

    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    
    estimatedDeliveryDate: {
  type: Date,
},

    orderDate: {
  type: Date,
  default: Date.now,
},
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;