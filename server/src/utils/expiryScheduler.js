import { Donation } from "../models/donation.models.js";
import asyncHandler from "./asyncHandler.js";
import expireddonation from "./expirydonation.js";
import cron from "node-cron";
const expiryschedule = asyncHandler(async () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const count = await expireddonation();
      console.log(`Expired Donation Count: ${count}`);
    } catch (error) {
      console.log("Error Occured", error.message);
    }
  });
  console.log("Scheduler Started");
});

export default expiryschedule;
