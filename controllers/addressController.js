import Address from "../model/addressModel.js";
import { User } from "../model/userModel.js";

// ✅ Create new address
export const addAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return res
        .status(400)
        .json({
          success: false,
          message: "All required fields must be filled",
        });
    }

    // If address is default, make all other addresses non-default
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user: userId,
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    });
    // ✅ Correctly push the new address reference into User model
    await User.findByIdAndUpdate(userId, { $push: { address: newAddress } });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: newAddress,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all addresses of a user
export const getAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const addresses = await Address.find({ user: userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const {
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    let address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    address.isDefault = isDefault ?? address.isDefault;

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    // ✅ Remove the address reference from the User's address array
    await User.findByIdAndUpdate(userId, { $pull: { address } });

    // ✅ Delete the address document
    await address.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
