import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json({ limit: "16KB" }));

app.use(express.urlencoded({ extended: true, limit: "16KB" }));
app.use(express.static("public"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());

import userRouter from "./src/routes/user.routes.js";

app.use("/api/v1/users", userRouter);

import donationrouter from "./src/routes/donation.routes.js";

app.use("/api/v1/donations", donationrouter);

app.use((err, req, res, next) => {
  const statusCode = err.statuscode || 500;

  res.status(statusCode).json({
    statuscode: statusCode,
    message: err.message || "Internal Server Error",
    data: err.data ?? null,
    success: false,
    errors: err.errors || [],
  });
});

export { app };
