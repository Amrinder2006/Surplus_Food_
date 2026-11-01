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
import createnotification from "../utils/createnotification.js";
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
  console.log("TEST OTP:", otp);

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
  const donor = await User.findById(donation.donor);
  if (!donor) throw new ApiError(400, "No donor Found");
  const receiver = await User.findById(pickup.receiver);

  if (!receiver) {
    throw new ApiError(404, "Receiver not found");
  }

  const session = await mongoose.startSession();
  try {
    (await session).startTransaction();
    donation.status = "PickedUp";
    pickup.status = "COMPLETED";
    pickup.verifiedAt = new Date();
    await donation.save({ session });
    await pickup.save({ session });
    (await session).commitTransaction();
  } catch (error) {
    (await session).abortTransaction();
  } finally {
    (await session).endSession();
  }

  try {
    await createnotification({
      recipient: donor._id,
      title: "Donation Picked Up",
      message: `Your donation "${donation.foodName}" has been successfully picked up by ${receiver.name}.`,
      relatedDonation: donation._id,
      type: "PICKUP_COMPLETED",
    });

    await createnotification({
      recipient: receiver._id,
      title: "Pickup Completed",
      message: `Your pickup of "${donation.foodName}" has been successfully verified.`,
      relatedDonation: donation._id,
      type: "PICKUP_COMPLETED",
    });
  } catch (error) {
    console.error("Notification Error:", error.message);
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: donor.email,
      subject: "Food Donation Successfully Picked Up",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 10px; color: #333;">

            <h2 style="color: #16a34a; text-align: center;">
                Donation Successfully Picked Up!
            </h2>

            <p>Hello ${donor.name},</p>

            <p>
                Your food donation has been successfully collected by the receiver.
                The pickup has been verified through our OTP verification system.
            </p>

            <div style="background-color: #f0fdf4; padding: 18px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #166534;">Donation Details</h3>

                <p><strong>Food Name:</strong> ${donation.foodName}</p>
                <p><strong>Quantity:</strong> ${donation.quantity} ${donation.unit}</p>
                <p><strong>Category:</strong> ${donation.category}</p>
                <p><strong>City:</strong> ${donation.city}</p>
                <p><strong>Collected By:</strong> ${receiver.name}</p>
            </div>

            <p>
                Your donation has helped make surplus food available to someone who needs it.
            </p>

            <p>Thank you for contributing towards reducing food waste.</p>

            <p>
                Regards,<br>
                <strong>Surplus Food Saver Team</strong>
            </p>

            <hr style="border: 0; border-top: 1px solid #e5e7eb;">

            <p style="font-size: 12px; color: #777; text-align: center;">
                This is an automated notification. Please do not reply to this email.
            </p>

        </div>
        `,
    });
  } catch (error) {
    console.error("Donor Email Error:", error.message);
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: receiver.email,
      subject: "Food Donation Pickup Successfully Completed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 10px; color: #333;">

            <h2 style="color: #16a34a; text-align: center;">
                Pickup Successfully Completed!
            </h2>

            <p>Hello ${receiver.name},</p>

            <p>
                Your pickup has been successfully verified.
                The food donation is now marked as collected in our system.
            </p>

            <div style="background-color: #f0fdf4; padding: 18px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #166534;">Pickup Details</h3>

                <p><strong>Food Name:</strong> ${donation.foodName}</p>
                <p><strong>Quantity:</strong> ${donation.quantity} ${donation.unit}</p>
                <p><strong>Category:</strong> ${donation.category}</p>
                <p><strong>City:</strong> ${donation.city}</p>
                <p><strong>Donated By:</strong> ${donor.name}</p>
            </div>

            <p>
                Thank you for helping ensure surplus food reaches people who need it.
            </p>

            <p>
                Regards,<br>
                <strong>Surplus Food Saver Team</strong>
            </p>

            <hr style="border: 0; border-top: 1px solid #e5e7eb;">

            <p style="font-size: 12px; color: #777; text-align: center;">
                This is an automated notification. Please do not reply to this email.
            </p>

        </div>
        `,
    });
  } catch (error) {
    console.error("Receiver Email Error:", error.message);
  }
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
