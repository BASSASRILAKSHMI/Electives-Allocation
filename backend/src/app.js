import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth.js";   
import analysisRoutes from "./routes/analysis.js";
import adminRouter from "./routes/admin.js";
import changePasswordRouter from "./routes/changePassword.js";
import promoteRoute from "./routes/promote.js";
import allocationHistoryRoutes from "./routes/allocationHistory.js";    
import adminElectivesRoutes from "./routes/adminElectives.js";
import studentElectivesRoutes from "./routes/studentElectives.js";  
import runAllocationRoutes from "./routes/runAllocation.js"; 
 



dotenv.config();
const app = express();

// ✅ CORS setup
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));


// ✅ Routes
app.use("/api/auth", authRoutes);

// Electives routes   
app.use("/api/analysis", analysisRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/change-password", changePasswordRouter);
app.use("/api/promote", promoteRoute);
app.use("/api/allocation-history", allocationHistoryRoutes);  
app.use("/api/admin/electives", adminElectivesRoutes);
app.use("/api/student/electives", studentElectivesRoutes);   
app.use("/api/admin/electives", runAllocationRoutes);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
