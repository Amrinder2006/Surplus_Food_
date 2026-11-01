import { isValidObjectId } from "mongoose";
import { Notification } from "../models/notification.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const fetchnotification = asyncHandler(async (req, res) => {
  const user = req.user;
  const notification = await Notification.aggregate([
    {
      $match: { recipient: user?._id },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification Created"));
});

const fetchunreadnotification = asyncHandler(async (req, res) => {
  const user = req.user;
  const notificationcnt = await Notification.aggregate([
    {
      $match: {
        recipient: req.user._id,
        read: false,
      },
    },

    {
      $count: "count",
    },
  ]);
  const totatnotification = notificationcnt[0]?.count || 0;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        totatnotification,
        "Total Unread Notification Fetched",
      ),
    );
});

const markasread = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(404, "Not a valid Object ID");

  const notification = await Notification.findOneAndUpdate(
    {
      _id: id,
      recipient: req.user._id,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!notification) throw new ApiError(400, "Notification Not found");

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

const markallread = asyncHandler(async (req, res) => {
  const user = req.user;

  const markedall = await Notification.updateMany(
    {
      recipient: user._id,
      read: false,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, markedall, "Marked ALL as read"));
});

export { fetchnotification, fetchunreadnotification, markasread, markallread };
