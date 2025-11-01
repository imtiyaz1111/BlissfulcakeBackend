import Coupon from "../model/couponModel.js";

// Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      startDate,
      endDate,
    } = req.body;

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const newCoupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minPurchase,
      startDate,
      endDate,
    });
    
    res
      .status(201)
      .json({
        success: true,
        message: "Coupon created successfully",
        coupon: newCoupon,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get All Coupons
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({
        success: true,
        message: "Coupons fetched successfully",
        data: coupons,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get Single Coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res
      .status(200)
      .json({
        success: true,
        message: "Coupon fetched successfully",
        data: coupon,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCoupon)
      return res.status(404).json({ message: "Coupon not found" });
    res
      .status(200)
      .json({
        success: true,
        message: "Coupon updated successfully",
        data: updatedCoupon,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    res
      .status(200)
      .json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Validate Coupon (for checkout)
export const validateCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid coupon code" });
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Coupon has expired or not active yet",
        });
    }

    if (totalAmount < coupon.minPurchase) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Minimum purchase required is ₹${coupon.minPurchase}`,
        });
    }

    // ✅ Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
