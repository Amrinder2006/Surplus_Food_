import { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Donation } from "../models/donation.models.js";
import { Report } from "../models/report.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import createnotification from "../utils/createnotification.js";
import { transporter } from "../utils/EmailSend.js";
import { User } from "../models/user.models.js";
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
  if (!status || !resolutionNote?.trim())
    throw new ApiError(409, "Invalid Credentials");
  if (!isValidObjectId(id)) throw new ApiError(403, "Not a valid object id");
  const report = await Report.findById(id);
  if (!report) throw new ApiError(404, "No report Found");
  const user = req.user;
  const reporter = await User.findById(report.reportedBy);
  if (!reporter) throw new ApiError(400, "No Reporter found");
  report.reviewedBy = user._id;
  report.reviewedAt = new Date();
  report.resolutionNote = resolutionNote;
  report.status = status;
  await report.save();

  try {
    await createnotification({
      recipient: report.reportedBy,
      title: "Report Successfully Reviewed",
      message: "Your report for donation was successfully reviewed",
      type: "REPORT_UPDATED",
      relatedDonation: report.donation,
    });
  } catch (error) {
    console.error("Error Occured while cresating notification", error.message);
  }

  try {
    const isResolved = report.status === "Resolved";
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: reporter.email,
      subject: "Report Reviewed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 10px; color: #333;">

            <h2 style="color: ${isResolved ? "#16a34a" : "#d97706"}; text-align: center;">
                ${isResolved ? "Report Resolved Successfully" : "Report Reviewed"}
            </h2>

            <p>Hello ${reporter.name},</p>

            <p>
                Your submitted report has been reviewed by our administration team.
                Please find the review details below.
            </p>

            <div style="background-color: ${isResolved ? "#f0fdf4" : "#fffbeb"}; padding: 18px; border-radius: 8px; margin: 20px 0;">

                <h3 style="margin-top: 0;">
                    Review Details
                </h3>

                <p>
                    <strong>Report ID:</strong> ${report._id}
                </p>

                <p>
                    <strong>Donation ID:</strong> ${report.donation}
                </p>

                <p>
                    <strong>Status:</strong>
                    <span style="font-weight: bold; color: ${isResolved ? "#16a34a" : "#d97706"};">
                        ${report.status}
                    </span>
                </p>

                <p>
                    <strong>Resolution Note:</strong>
                </p>

                <p style="background-color: #ffffff; padding: 12px; border-radius: 5px;">
                    ${report.resolutionNote}
                </p>

            </div>

            <p>
                ${
                  isResolved
                    ? "Your report has been successfully resolved by our administration team."
                    : "After reviewing the submitted information, our administration team has decided to dismiss this report."
                }
            </p>

            <p>
                Thank you for helping us maintain a safe and reliable food donation platform.
            </p>

            <p>
                Regards,<br>
                <strong>Surplus Food Saver Team</strong>
            </p>

            <hr style="border: 0; border-top: 1px solid #e5e7eb;">

            <p style="font-size: 12px; color: #777; text-align: center;">
                This is an automated notification. Please do not reply to this email.
            </p>

        </div>
        `,
    });
  } catch (error) {
    console.error("Erorr Occured while sending email", error.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Report Reviewed Successfully"));
});

export { createreport, fetchreports, fetchreportbyid, reportreview };
