import express from "express";

import cors from "cors";
import cron from "node-cron"
import booksRouter from "./routes/book.route.js";
import membersRouter from "./routes/member.route.js";
import connectDatabase from "./config/database.js";
import staffRouter from "./routes/staff.route.js";
import loansRouter from "./routes/loan.route.js";
import finesRouter from "./routes/fine.route.js";
import memberAuthRoutes from "./routes/auth.member.route.js";
import { configDotenv } from "dotenv";

const app = express();

// middleware
configDotenv();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/loans", loansRouter);
app.use("/api/members", membersRouter);
app.use("/api/books", booksRouter);
app.use("/api/staff", staffRouter);
app.use("/api/fines", finesRouter);
app.use("/api/member/", memberAuthRoutes);


// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// centralized error handler (last middleware)
app.use((err, _req, res, _next) => {
  console.error(err);
  // Handle a common Mongoose validation error shape nicely
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.fromEntries(
        Object.entries(err.errors).map(([k, v]) => [k, v.message])
      ),
    });
  }
  res.status(500).json({ success: false, message: "Server error" });
});
const port = process.env.PORT || 4000;

// ✅ Schedule: run every day at 2:00 AM (server local time)
cron.schedule(
  "0 2 * * *",
  async () => {
    console.log("⏰ Running daily fine sweep...");
    try {
      const result = await runFineSweep();
      console.log("✅ Fine sweep completed:", result);
    } catch (err) {
      console.error("❌ Fine sweep failed:", err);
    }
  },
  { timezone: "Europe/Copenhagen" } // set the correct TZ for your environment
);
connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
