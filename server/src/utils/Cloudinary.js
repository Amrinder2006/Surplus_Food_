import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
const uploadcloud = async function (FilePath) {
  if (!FilePath) return null;
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const res = await cloudinary.uploader.upload(FilePath);
    console.log("Cloudinary Result", res);
    return res.secure_url;
  } catch (error) {
    console.log(error.message);
    return null;
  } finally {
    if (fs.existsSync(FilePath)) {
      fs.unlinkSync(FilePath);
    }
  }
};
