import { Donation } from "../models/donation.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import createnotification from "../utils/createnotification.js";
import { transporter } from "../utils/EmailSend.js";
import { User } from "../models/user.models.js";
const reservedonation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid donation ID");
  }

  const donation = await Donation.findOneAndUpdate(
    {
      _id: id,
      status: "Available",
      expiryAt: { $gt: new Date() },
      donor: { $ne: req.user._id },
    },
    {
      $set: {
        status: "Reserved",
        receiver: req.user._id,
      },
    },
    { new: true, runValidators: true },
  );

  if (!donation) {
    throw new ApiError(404, "Donation not found");
  }

  await donation.save();

  const donor = await User.findById(donation.donor);
  if (!donor) throw new ApiError(400, "No Donor Found");
  try {
    const notification = await createnotification({
      recipient: donor._id,
      title: "Donation Reserved",
      message: "Your Donation is Rerserved",
      type: "DONATION_RESERVED",
      relatedDonation: id,
    });
  } catch (error) {
    console.error("Error Occured while creatin notiffication", error.message);
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: donor.email,
      subject: "Donation Reserved",
      html: ` 
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 10px; color: #333;">

    <h2 style="color: #16a34a; text-align: center;">
      Donation Reserved Successfully!
    </h2>

    <p>Hello,</p>

    <p>
      Your food donation has been successfully reserved by a receiver.
      Thank you for contributing towards reducing food waste.
    </p>

    <div style="background-color: #f0fdf4; padding: 18px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #166534;">Donation Details</h3>

      <p><strong>Food Name:</strong> ${donation.foodName}</p>
      <p><strong>Quantity:</strong> ${donation.quantity} ${donation.unit}</p>
      <p><strong>Category:</strong> ${donation.category}</p>
      <p><strong>City:</strong> ${donation.city}</p>
      <p><strong>Reserved By:</strong> ${req.user.name}</p>
    </div>

    <p>
      Please coordinate with the receiver to arrange the pickup.
    </p>

    <p>Thank you for helping make surplus food useful to someone in need.</p>

    <p style="margin-top: 25px;">
      Regards,<br />
      <strong>Surplus Food Saver Team</strong>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 25px;" />

    <p style="font-size: 12px; color: #777; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>

  </div>
`,
    });
  } catch (error) {
    console.error("Email Sending Error for reservation", error.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, donation, "Donation reserved successfully"));
});

const cancelreservation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "No valid Id provided");
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid donation ID");
  }

  const donation = await Donation.findById(id);
  if (!donation) throw new ApiError(404, "No Valid Donation Found");

  if (donation.status !== "Reserved")
    throw new ApiError(409, "Donation is not reserved");

  const receiver = req.user;
  if (donation.receiver.toString() !== receiver._id.toString())
    throw new ApiError(403, "Not authorized for Cancelling Requests");
  const donor = await User.findById(donation.donor);
  if (!donor) throw new ApiError(400, "Not a valid donor");
  donation.status = "Available";
  donation.receiver = null;
  await donation.save();

  try {
    await createnotification({
      recipient: donor._id,
      title: "reservation Cancelled",
      message: "your Donation is Cancelled",
      relatedDonation: id,
      type: "RESERVATION_CANCELLED",
    });
  } catch (error) {
    console.error("Error Occured while crating notification", error.message);
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: donor.email,
      subject: "Reservation Cancelled",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #d97706;">Reservation Cancelled</h2>

            <p>Hello ${donor.name},</p>

            <p>
                The reservation for your food donation
                <strong>${donation.foodName}</strong>
                has been cancelled by the receiver.
            </p>

            <p>
                Your donation is now marked as
                <strong style="color: #16a34a;">Available</strong>
                and can be reserved by another receiver.
            </p>

            <p><strong>Donation Details:</strong></p>
            <ul>
                <li><strong>Food:</strong> ${donation.foodName}</li>
                <li><strong>Quantity:</strong> ${donation.quantity} ${donation.unit}</li>
                <li><strong>City:</strong> ${donation.city}</li>
            </ul>

            <p>
                Thank you for helping reduce food waste.
            </p>

            <hr style="border: 0; border-top: 1px solid #ddd;">

            <p style="font-size: 12px; color: #777;">
                This is an automated notification from Surplus Food Saver.
            </p>
        </div>`,
    });
  } catch (error) {
    console.error("Error occured while sending mail", error.message);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, donation, "Reservation Cancelled Successfully"));
});

export { reservedonation, cancelreservation };
