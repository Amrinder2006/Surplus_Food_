
import { Donation } from "../models/donation.models.js";

const expireddonation = async () => {
  const result = await Donation.updateMany(
    {
      status: "Available",
      expiryAt: { $lte: new Date() }
    },
    {
      $set: {
        status: "Expired"
      }
    }
  );

  return result.modifiedCount;
};

export default expireddonation;
