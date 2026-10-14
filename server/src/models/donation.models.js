import mongoose from "mongoose";

const donationschema = mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    foodName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Cooked Food",
        "Raw Ingredients",
        "Packaged Food",
        "Bakery",
        "Fruits & Vegetables",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0.01,
    },
    unit: {
      type: String,
      enum: ["kg", "grams", "litres", "ml", "plates", "packets", "boxes"],
      required: true,
    },
    image: {
      type: String,
    },
    preparedAt: {
      type: Date,
      required: true,
    },
    expiryAt: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return !this.preparedAt || value > this.preparedAt;
        },
        message: "Expire Time SHould be greater than Preparation Time",
      },
    },
    city: {
      type: String,
      required: true,
    },
    pickupArea: {
      type: String,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    specialInstructions: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Available", "Reserved", "PickedUp", "Expired", "Cancelled"],
      default: "Available",
    },
    priorityScore: {
      type: Number,
    },
    priorityLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

donationschema.methods.isFoodExpired = function () {
  return this.preparedAt >= this.expiryAt || new Date() >= this.expiryAt;
};

export const Donation = mongoose.model("Donation", donationschema);
