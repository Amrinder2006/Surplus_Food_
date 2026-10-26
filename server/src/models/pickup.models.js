import mongoose from "mongoose";

const pickupschema = mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ScheduledTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Pickup = mongoose.model("Pickup", pickupschema);
