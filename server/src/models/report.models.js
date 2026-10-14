import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      enum: [
        "Spoiled Food",
        "Incorrect Information",
        "Fake Donation",
        "Expired Food",
        "Inappropriate Content",
        "Other",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["Pending", "UnderReview", "Resolved", "Rejected"],
      default: "Pending",
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    resolutionNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

export const Report = mongoose.model("Report", reportSchema);
