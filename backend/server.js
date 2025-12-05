import express from "express";
import cors from "cors";
import cron from "node-cron";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
import rateLimit from "express-rate-limit"; 

import booksRouter from "./routes/book.route.js";
import membersRouter from "./routes/member.route.js";
import connectDatabase from "./config/database.js";
import staffRouter from "./routes/staff.route.js";
import loansRouter from "./routes/loan.route.js";
import finesRouter from "./routes/fine.route.js";
import memberAuthRoutes from "./routes/auth.member.route.js";
import staffAuthRoutes from "./routes/auth.staff.route.js";
import paymentRoutes from "./routes/payment.route.js";
import { sweepFines } from "./controllers/fine.controller.js";

const app = express();


configDotenv();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000,                  
  standardHeaders: true,     
  legacyHeaders: false,    
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000,                  
  message: {
    success: false,
    message: "Too many attempts from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


app.use("/api", apiLimiter);


app.use("/api/auth", authLimiter);


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

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// centralized error handler 
app.use((err, _req, res, _next) => {
  console.error(err);

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

  res.status(500).json({ success: false, message: "Server error" });
});

const port = process.env.PORT || 4000;



connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
