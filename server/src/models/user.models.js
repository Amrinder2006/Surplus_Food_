import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userschema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Donor", "Receiver", "Admin"],
      default: "Donor",
      required: true,
    },
    organization: {
      type: String,
      enum: ["EventOrganizer", "Mess", "Canteen", "NGO", "Other", ""],
      default: "",
    },
    profileImg: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    area: {
      type: String,
    },
    citiesServed: {
      type: [String],
      default: [],
    },
    verificationSatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected", "Suspended"],
      default: "Pending",
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

userschema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
});

userschema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userschema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userschema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};
export const User = mongoose.model("User", userschema);
