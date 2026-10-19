import { Donation } from "../models/donation.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
const createdonation = asyncHandler(async (req, res) => {
  const {
    foodName,
    category,
    description,
    quantity,
    unit,
    image,
    preparedAt,
    expiryAt,
    city,
    pickupArea,
    pickupAddress,
    specialInstructions,
  } = req.body;
  const donor = req.user?._id;
  if (
    [
      donor,
      foodName,
      category,
      unit,
      preparedAt,
      expiryAt,
      city,
      pickupAddress,
    ].some((field) => !field || (typeof field === "string" && !field.trim()))
  ) {
    throw new ApiError(400, "Invalid Credentials");
  }

  const expiryDate = new Date(expiryAt);
  const preparedDate = new Date(preparedAt);
  if (quantity == "" || quantity == null || quantity < 0)
    throw new ApiError(400, "Invalid Quantity");

  if (expiryDate < preparedDate || expiryDate <= new Date())
    throw new ApiError(400, "Invalid Expiry Date");

  const donation = await Donation.create({
    donor,
    foodName,
    category,
    description,
    quantity,
    unit,
    image,
    preparedAt,
    expiryAt,
    city,
    pickupArea,
    pickupAddress,
    specialInstructions,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, donation, "Donation Created"));
});

const fetchdonations = asyncHandler(async (req, res) => {
  const { city, category } = req.query;
  const donations = await Donation.aggregate([
    {
      $match: {
        status: "Available",
        ...(city && { city }),
        ...(category && category != "All" && { category }),
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, donations, "Donations Fetched"));
});

const fetchdonationbyid = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Donation ID");
  }
  const donation = await Donation.findOne({
    _id: id,
    status: "Available",
  });
  if (!donation) throw new ApiError(400, "No Donation Found");
  return res
    .status(200)
    .json(new ApiResponse(200, donation, "User By ID Fetched"));
});
export { createdonation, fetchdonations, fetchdonationbyid };
