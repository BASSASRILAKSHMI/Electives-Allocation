// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";

// // Routes
// import authRoutes from "./routes/auth.js";   
// import analysisRoutes from "./routes/analysis.js";
// import adminRouter from "./routes/admin.js";
// import changePasswordRouter from "./routes/changePassword.js";
// import promoteRoute from "./routes/promote.js";
// import allocationHistoryRoutes from "./routes/allocationHistory.js";    
// import adminElectivesRoutes from "./routes/adminElectives.js";
// import studentElectivesRoutes from "./routes/studentElectives.js";  
// import runAllocationRoutes from "./routes/runAllocation.js"; 
 



// dotenv.config();
// const app = express();

// // ✅ CORS setup
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// // ✅ Middleware
// app.use(express.json());
// app.use("/uploads", express.static("src/uploads"));


// // ✅ Routes
// app.use("/api/auth", authRoutes);

// // Electives routes   
// app.use("/api/analysis", analysisRoutes);
// app.use("/api/admin", adminRouter);
// app.use("/api/change-password", changePasswordRouter);
// app.use("/api/promote", promoteRoute);
// app.use("/api/allocation-history", allocationHistoryRoutes);  
// app.use("/api/admin/electives", adminElectivesRoutes);
// app.use("/api/student/electives", studentElectivesRoutes);   
// app.use("/api/admin/electives", runAllocationRoutes);

// // ✅ MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // ✅ Start Server
// const PORT = process.env.PORT || 8080;
// app.get("/", (req, res) => {
//   res.send("Electives Allocation Backend Running 🚀");
// });
// // For local development
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// // For Vercel serverless
// export default app;

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
dotenv.config();
console.log("🔍 MONGO_URI loaded:", process.env.MONGO_URI ? "Yes ✅" : "No ❌");
const app = express();

// ✅ CORS setup — allows local dev + deployed frontend
// ✅ CORS setup — allows local dev + deployed frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean); // removes undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log("❌ CORS blocked origin:", origin);
      return callback(null, false); // reject without throwing
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests explicitly
// Handle preflight requests explicitly
app.options(/.*/, cors());
// ✅ Middleware
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/change-password", changePasswordRouter);
app.use("/api/promote", promoteRoute);
app.use("/api/allocation-history", allocationHistoryRoutes);
app.use("/api/admin/electives", adminElectivesRoutes);
app.use("/api/student/electives", studentElectivesRoutes);
app.use("/api/admin/electives", runAllocationRoutes);

// ✅ MongoDB Connection (cached for serverless)
// ✅ MongoDB Connection
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

// Connect immediately on startup (for local dev and serverless cold start)
connectDB().catch(err => {
  console.error("❌ Initial DB connection failed:", err.message);
});

// Ensure connection before each request (for serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Electives Allocation Backend Running 🚀");
});

// ✅ Local development server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// ✅ Export for Vercel serverless
export default app;