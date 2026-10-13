import mongoose from "mongoose";
import { DB_NAME } from "../../constants.js";
export const connectdb = async () => {
  try {
    const mongo = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
    console.log("MongoDB Connection set:", mongo.connection.host);
  } catch (error) {
    console.log("Error while connecting with DB", error.message);
    process.exit(1);
  }
};
