import { Donation } from "../models/donation.models.js";
import { User } from "../models/user.models.js";
import { Report } from "../models/report.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  // Total users
  const usercnt = await User.aggregate([{ $count: "total_users" }]);
  const totalUsers = usercnt[0]?.total_users || 0;

  // Total donors
  const donorcnt = await User.aggregate([
    { $match: { role: "Donor" } },
    { $count: "total_donors" },
  ]);
  const totalDonors = donorcnt[0]?.total_donors || 0;

  // Total receivers
  const receivercnt = await User.aggregate([
    { $match: { role: "Receiver" } },
    { $count: "total_receivers" },
  ]);
  const totalReceivers = receivercnt[0]?.total_receivers || 0;

  // Total donations
  const donatcnt = await Donation.aggregate([{ $count: "total_donations" }]);
  const totalDonations = donatcnt[0]?.total_donations || 0;

  // Available donations
  const availablecnt = await Donation.aggregate([
    { $match: { status: "Available" } },
    { $count: "total_available" },
  ]);
  const totalAvailable = availablecnt[0]?.total_available || 0;

  // Reserved donations
  const reservedcnt = await Donation.aggregate([
    { $match: { status: "Reserved" } },
    { $count: "total_reserved" },
  ]);
  const totalReserved = reservedcnt[0]?.total_reserved || 0;

  // Completed pickups
  const pickedupcnt = await Donation.aggregate([
    { $match: { status: "PickedUp" } },
    { $count: "total_pickedup" },
  ]);
  const totalPickedUp = pickedupcnt[0]?.total_pickedup || 0;

  // Expired donations
  const expiredcnt = await Donation.aggregate([
    { $match: { status: "Expired" } },
    { $count: "total_expired" },
  ]);
  const totalExpired = expiredcnt[0]?.total_expired || 0;

  // Cancelled donations
  const cancelledcnt = await Donation.aggregate([
    { $match: { status: "Cancelled" } },
    { $count: "total_cancelled" },
  ]);
  const totalCancelled = cancelledcnt[0]?.total_cancelled || 0;

  // Pending reports
  const pendingcnt = await Report.aggregate([
    { $match: { status: "PENDING" } },
    { $count: "total_pending" },
  ]);
  const totalPending = pendingcnt[0]?.total_pending || 0;

  // Resolved reports
  const resolvedcnt = await Report.aggregate([
    { $match: { status: "RESOLVED" } },
    { $count: "total_resolved" },
  ]);
  const totalResolved = resolvedcnt[0]?.total_resolved || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalDonors,
        totalReceivers,
        totalDonations,
        totalAvailable,
        totalReserved,
        totalPickedUp,
        totalExpired,
        totalCancelled,
        totalPending,
        totalResolved,
      },
      "All data retrieved successfully",
    ),
  );
});

const getdonationbycategory = asyncHandler(async (req, res) => {
  const getbycategory = await Donation.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, getbycategory, "By Category Fetched"));
});

const getbycreationdate = asyncHandler(async (req, res) => {
  const getbydate = await Donation.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, getbydate, "Count by diff=erent dates fetched"));
});

export { getDashboardStats, getdonationbycategory, getbycreationdate };
