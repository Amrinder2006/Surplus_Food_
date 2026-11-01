import { Notification } from "../models/notification.models.js";
import ApiError from "./ApiError.js";


const createnotification = async ({
  recipient,
  title,
  message,
  type,
  relatedDonation = null,
}) => {
 

  if (!recipient || !title?.trim() || !message?.trim() || !type)
    throw new ApiError(400, "Invalid Input");

  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    relatedDonation,
  });

  return notification;
};

export default createnotification;
