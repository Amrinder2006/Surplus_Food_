import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
const jwtverify = asyncHandler(async (req, res, next) => {
  const refreshToken =
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.cookies?.AccessToken;

  if (!refreshToken) throw new ApiError(401, "No refresh Token Found");

  const decodedToken = jwt.verify(
    refreshToken,
    process.env.ACCESS_TOKEN_SECRET,
  );
  if (!decodedToken) throw new ApiError(401, "Cannot Decode it");

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken",
  );
  if (!user) throw new ApiError(401, "No matching user with token Found");

  req.user = user;
  next();
});

export default jwtverify;
