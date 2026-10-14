import mongoose from "mongoose";

const notificationschema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "NEW_DONATION",
        "DONATION_RESERVED",
        "PICKUP_SCHEDULED",
        "PICKUP_COMPLETED",
        "DONATION_EXPIRING",
        "DONATION_EXPIRED",
        "USER_VERIFIED",
        "REPORT_UPDATED",
      ],
      default: "NEW_DONATION",
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Notification = mongoose.model("Notification", notificationschema);
