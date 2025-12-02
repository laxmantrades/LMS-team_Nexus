import express from "express";

import cors from "cors";
import cron from "node-cron";
import booksRouter from "./routes/book.route.js";
import membersRouter from "./routes/member.route.js";
import connectDatabase from "./config/database.js";
import staffRouter from "./routes/staff.route.js";
import loansRouter from "./routes/loan.route.js";
import finesRouter from "./routes/fine.route.js";
import memberAuthRoutes from "./routes/auth.member.route.js";
import staffAuthRoutes from "./routes/auth.staff.route.js";
import paymentRoutes from "./routes/payment.route.js";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";

import { sweepFines } from "./controllers/fine.controller.js";



const app = express();

// middleware
configDotenv();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);




// Run every night at 02:00
cron.schedule("0 2 * * *", async () => {
  try {
    console.log("[CRON] Running fine sweep job...");
    const result = await sweepFines();
    console.log("[CRON] Fine sweep result:", {
      processed_loans: result.processed_loans,
      updated_fines: result.updated_fines,
    });
  } catch (err) {
    console.error("[CRON] Fine sweep failed:", err);
  }
});


app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/loans", loansRouter);
app.use("/api/members", membersRouter);
app.use("/api/books", booksRouter);
app.use("/api/staff", staffRouter);
app.use("/api/fines", finesRouter);
app.use("/api/auth/member", memberAuthRoutes);
app.use("/api/auth/staff", staffAuthRoutes);
app.use("/api/payment", paymentRoutes);

// health checkk
app.get("/health", (_req, res) => res.json({ ok: true }));

// centralized error handler (last middleware)
app.use((err, _req, res, _next) => {
  console.error(err);

  // Mongoose ValidationError (schema validation)
  if (err.name === "ValidationError") {
    const errors = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Mongoose CastError (e.g. invalid type like "abc" for Number)
  if (err.name === "CastError") {
    const errors = {
      [err.path || "value"]: err.message,
    };

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Fallback for everything else
  res.status(500).json({ success: false, message: "Server error" });
});

const port = process.env.PORT || 4000;

// Schedule: run every day at 2:00 AM (server local time)
cron.schedule(
  "0 2 * * *",
  async () => {
    console.log("⏰ Running daily fine sweep...");
    try {
      const result = await runFineSweep();
      console.log(" Fine sweep completed:", result);
    } catch (err) {
      console.error("Fine sweep failed:", err);
    }
  },
  { timezone: "Europe/Copenhagen" } // set the correct TZ for your environment
);
connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
