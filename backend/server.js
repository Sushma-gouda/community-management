/**
 * Communa Backend Server
 *
 * Minimal Express server for the Community Apartment Management System.
 * This backend is intentionally lightweight — most data operations go
 * directly through Supabase from the frontend.
 *
 * Use this server for:
 *   - Scheduled jobs (payment reminders, report generation)
 *   - Webhook receivers (payment gateway callbacks)
 *   - Heavy server-side processing not suitable for Edge Functions
 *   - Third-party integrations (SMS, email, push notifications)
 */

import "dotenv/config";
import express from "express";
import cors from "cors";

// Route imports (add as you build them)
// import authRoutes from "./routes/auth.js";
// import billingRoutes from "./routes/billing.js";
// import notificationRoutes from "./routes/notifications.js";

// Cron jobs
import "./cron/paymentReminder.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

// ---- Middleware ----
app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Request logging (dev only) ----
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ---- Health check ----
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "communa-backend",
    timestamp: new Date().toISOString(),
  });
});

// ---- API Routes ----
// app.use("/api/auth", authRoutes);
// app.use("/api/billing", billingRoutes);
// app.use("/api/notifications", notificationRoutes);

// ---- 404 handler ----
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ---- Global error handler ----
app.use((err, _req, res, _next) => {
  console.error("[Server Error]", err);
  res.status(err.status ?? 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ---- Start ----
app.listen(PORT, () => {
  console.log(`✓ Communa backend running on http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
});

export default app;
