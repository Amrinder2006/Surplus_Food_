import { Donation } from "../models/donation.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const reservedonation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid donation ID");
  }

  const donation = await Donation.findById(id);

  if (!donation) {
    throw new ApiError(404, "Donation not found");
  }

  if (donation.status !== "Available") {
    throw new ApiError(409, "Donation is not available");
  }

  const receiver = req.user;

  if (receiver._id.toString() === donation.donor.toString()) {
    throw new ApiError(403, "You cannot reserve your own donation");
  }

  donation.receiver = receiver._id;
  donation.status = "Reserved";

  await donation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, donation, "Donation reserved successfully"));
});

const cancelreservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "No valid Id provided");

  const donation = await Donation.findById(id);
  if (!donation) throw new ApiError(400, "No Valid Donation Found");

  if (donation.status !== "Reserved")
    throw new ApiError(400, "Donation is not reserved");

  const receiver = req.user;
  if (donation.receiver.toString() !== receiver._id.toString())
    throw new ApiError(403, "Not authorized for Cancelling Requests");

  donation.status = "Available";
  donation.receiver = null;
  await donation.save();
  return res
    .status(201)
    .json(new ApiResponse(201, donation, "Reservation Cancelled Successfully"));
});

export { reservedonation, cancelreservation };
