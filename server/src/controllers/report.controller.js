import { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Donation } from "../models/donation.models.js";
import { Report } from "../models/report.models.js";
import ApiResponse from "../utils/ApiResponse.js";

const createreport = asyncHandler(async (req, res) => {
  const user = req.user;
  const { reason, description } = req.body;
  if (!reason || !description)
    throw new ApiError(404, "Invalid Values Provided");
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Not a valid ID");
  const donation = await Donation.findById(id);
  if (!donation) throw new ApiError(404, "No Valid Donation Found");

  const report = await Report.create({
    donation: donation._id,
    reportedBy: user._id,
    reason,
    description,
  });

  return res.status(201).json(new ApiResponse(201, report, "Report Created"));
});

const fetchreports = asyncHandler(async (req, res) => {
  const reports = await Report.aggregate([
    {
      $match: {
        status: "Pending",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, reports, "Fetched All Pending Reports"));
});

const fetchreportbyid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(403, "Not a valid Id");
  const report = await Report.findById(id);
  if (!report) throw new ApiError(404, "No Report Found");

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Report by Id Fetched"));
});

const reportreview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, resolutionNote } = req.body;
  if (!status || !resolutionNote)
    throw new ApiError(409, "Invalid Credentials");
  if (!isValidObjectId(id)) throw new ApiError(403, "Not a valid object id");
  const report = await Report.findById(id);
  if (!report) throw new ApiError(404, "No report Found");
  const user = req.user;

  report.reviewedBy = user._id;
  report.reviewedAt = new Date();
  report.resolutionNote = resolutionNote;
  report.status = status;
  await report.save();

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Report Reviewed Successfully"));
});

export { createreport, fetchreports, fetchreportbyid, reportreview };
