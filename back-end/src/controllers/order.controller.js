



import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// Place order using Cash on Delivery
export const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      billingAddress,
      couponCode,
    } = req.body;

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    const validAddress = (address) =>
      address &&
      requiredFields.every(
        (field) =>
          typeof address[field] === "string" &&
          address[field].trim() !== ""
      );

    if (!validAddress(shippingAddress)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete shipping address",
      });
    }

    const finalBillingAddress =
      billingAddress || shippingAddress;

    if (!validAddress(finalBillingAddress)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete billing address",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (
      !cart ||
      !cart.items ||
      cart.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    // Validate products and quantities
    for (const item of cart.items) {
      const product = item.product;
      const quantity = Number(item.quantity);

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "A product in your cart no longer exists",
        });
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has insufficient stock`,
        });
      }

      subtotal += product.price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    // Apply coupon code
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const normalizedCoupon =
        couponCode.trim().toUpperCase();

      if (normalizedCoupon === "SAVE10") {
        discount = Number(
          (subtotal * 0.1).toFixed(2)
        );

        appliedCoupon = "SAVE10";
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code",
        });
      }
    }

    // Calculate discounted subtotal
    const discountedSubtotal = Number(
      (subtotal - discount).toFixed(2)
    );

    // Free shipping on orders of ₹999 or more
    const shippingCharge =
      discountedSubtotal >= 999 ? 0 : 50;

    // GST at 18%
    const gst = Number(
      (discountedSubtotal * 0.18).toFixed(2)
    );

    // Final amount
    const totalAmount = Number(
      (
        discountedSubtotal +
        shippingCharge +
        gst
      ).toFixed(2)
    );

    // Calculate estimated delivery date (5 days)
    const orderDate = new Date();
    const estimatedDeliveryDate = new Date(orderDate);

    estimatedDeliveryDate.setDate(
      estimatedDeliveryDate.getDate() + 5
    );

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      billingAddress: finalBillingAddress,
      subtotal,
      discount,
      couponCode: appliedCoupon,
      shippingCharge,
      gst,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Pending",

      // Delivery date fields
      estimatedDeliveryDate,
    });

    // Reduce product stock safely
    const updatedProducts = [];

    for (const item of orderItems) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        }
      );

      if (result.modifiedCount !== 1) {
        // Restore stock already deducted
        for (const updated of updatedProducts) {
          await Product.updateOne(
            { _id: updated.product },
            {
              $inc: {
                stock: updated.quantity,
              },
            }
          );
        }

        await Order.findByIdAndDelete(order._id);

        return res.status(409).json({
          success: false,
          message:
            "Stock changed. Please try again.",
        });
      }

      updatedProducts.push(item);
    }

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully with COD",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
      error: error.message,
    });
  }
};

// Admin: view all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Admin: update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const { orderStatus } = req.body;

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
