import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Donation } from "../models/donation.models.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { Pickup } from "../models/pickup.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import { transporter } from "../utils/EmailSend.js";
import { User } from "../models/user.models.js";
const createpickup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = req.user._id;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Not a valid ID");

  const donation = await Donation.findById(id);
  if (!donation) throw new ApiError(409, "No Donation Exists");

  if (donation.status !== "Reserved")
    throw new ApiError(409, "Donation is not Reserved");

  const donor = donation.donor;
  const receiver = donation.receiver;
  const users = await User.findById(donor);
  if (!users) throw new ApiError(400, "No USer Found");
  if (receiver.toString() !== user.toString())
    throw new ApiError(403, "Unauthorized User");
  const existingPickup = await Pickup.findOne({
    donation: donation._id,
    status: "PENDING",
  });

  if (existingPickup) {
    throw new ApiError(409, "A pickup is already pending");
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  // console.log("TEST OTP:", otp);

  const otphash = await bcrypt.hash(otp, 10);
  const otpexpiry = new Date(Date.now() + 10 * 60 * 1000);

  const pickup = await Pickup.create({
    donation: donation,
    donor: donor,
    receiver: receiver,
    ScheduledTime: new Date(Date.now()),
    otp: otphash,
    otpExpiresAt: otpexpiry,
    status: "PENDING",
  });
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: users.email,
      subject: "OTP for Verification",
      html: `<p>Your food pickup verification OTP is <strong>${otp}</strong>.</p>
       <p>This OTP expires in 10 minutes. Do not share it with anyone except the intended receiver.</p>`,
    });

    console.log("Email accepted:", info.messageId);
    console.log("Accepted recipients:", info.accepted);
    console.log("Rejected recipients:", info.rejected);
  } catch (error) {
    console.log("Email Sending Error:", error.message);
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        pickupId: pickup._id,
        status: pickup.status,
        otpExpiresAt: pickup.otpExpiresAt,
      },
      "New Pickup Response Added",
    ),
  );
});

const pickupverify = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;
  const user = req.user;

  const pickup = await Pickup.findById(id);
  if (!pickup) throw new ApiError(409, "No Pickup Found");

  if (user._id.toString() !== pickup.receiver.toString())
    throw new ApiError(403, "Unauthorized User");

  if (pickup.otpExpiresAt <= new Date(Date.now()))
    throw new ApiError(403, "Otp has expired");
  if (pickup.attempts > 5)
    throw new ApiError(403, "Maximum OTP Attempts Reached");
  if (pickup.status !== "PENDING")
    throw new ApiError(403, "Donation is not pending");

  const pass = await bcrypt.compare(otp, pickup.otp);
  console.log("OTP matched:", pass);
  if (!pass) {
    pickup.attempts++;
    if (pickup.attempts > 5) {
      pickup.status = "FAILED";
    }
    await pickup.save();
    throw new ApiError(403, "OTP didn't matched");
  }
  const donation = await Donation.findById(pickup.donation);
  if (!donation) throw new ApiError(400, "Not a Valid Donor");

  donation.status = "PickedUp";
  pickup.status = "COMPLETED";
  pickup.verifiedAt = new Date(Date.now());
  await donation.save();
  await pickup.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { donationId: donation._id, pickupid: pickup._id },
        "OTP Verified Successfully",
      ),
    );
});

export { createpickup, pickupverify };
