import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import jwtverify from "../middlewares/auth.middleware.js";

const generateAccessRefreshToken = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(409, "No User Found");
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  return { accessToken, refreshToken };
};
const registeruser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    organization,
    profileImg,
    city,
    area,
    citiesServed,
  } = req.body;
  if (
    [name, email, phone, password, city].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "Invalid or Empty Credentials");
  }

  const user1 = await User.findOne({
    $or: [{ email }, { phone }],
  });
  if (user1) throw new ApiError(409, "User Already Exists");
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    organization,
    profileImg,
    city,
    area,
    citiesServed,
  });

  const temp = await User.findById(user._id).select("-password -refreshToken");
  return res
    .status(201)
    .json(new ApiResponse(201, temp, "User Registerd Successfully"));
});

const loginuser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new ApiError(400, "Invalid or Empty Credentials");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(409, "User doesnt exist");

  const isPass = await user.isPasswordCorrect(password);
  if (!isPass) throw new ApiError(409, "Incorrect Password");

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id,
  );
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("AccessToken", accessToken, options)
    .cookie("RefreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { accessToken, refreshToken }, "User Logged in"),
    );
});

const currentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(409, "No user Exists");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current USer fetched"));
});

const changepassword = asyncHandler(async (req, res) => {
  const { oldpass, newpass } = req.body;
  if (!newpass || !oldpass)
    throw new ApiError(400, "Invalid or Empty Credentials");
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(409, "No User found");
  const isPass = await user.isPasswordCorrect(oldpass);
  if (!isPass) throw new ApiError(409, "Password Didn't matched");
  user.password = newpass;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, {}, "Password Changed"));
});

const logoutuser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true },
  );
  if (!user) throw new ApiError(409, "No User Found");
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("AccessToken", undefined, options)
    .cookie("RefreshToken", undefined, options)
    .json(new ApiResponse(200, {}, "LogOut Successfully"));
});

const refreshaccesstoken = asyncHandler(async (req, res) => {
  const IncToken = req.cookies?.RefreshToken || req.body?.RefreshToken;
  if (!IncToken) throw new ApiError(409, "No valid Token Found");
  const decoded = jwt.verify(IncToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded?._id);
  if (!user) throw new ApiError(401, "No User Found");
  if (user.refreshToken != IncToken)
    throw new ApiError(401, "Invalid or Unauthorized User");

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id,
  );
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("AccessToken", accessToken, options)
    .cookie("RefreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access Token Refreshed",
      ),
    );
});

const admindash = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(401, "No User found");
  return res.status(200).json(new ApiResponse(200, user, "Admin Logged in"));
});

const updatecredentials = asyncHandler(async (req, res) => {
  const user = req.user;
  const allowdFields = [
    "name",
    "phone",
    "organization",
    "city",
    "area",
    "citiesServed",
  ];
  for (const field of allowdFields) {
    if (req.body[field] != undefined) {
      user[field] = req.body[field];
    }
  }
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Updated user credentials"));
});

export {
  registeruser,
  loginuser,
  currentUser,
  changepassword,
  logoutuser,
  refreshaccesstoken,
  admindash,
  updatecredentials,
};
