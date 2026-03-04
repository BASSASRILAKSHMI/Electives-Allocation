import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import electivesRouter from "./routes/electives";
import preferencesRouter from "./routes/preferences"; // ✅ Import this
import responseStatusRouter from "./routes/response-status";
 
 import analysisRoutes from "./routes/analysis";



dotenv.config();
const app = express();

// in app.ts
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/electives", electivesRouter);
app.use("/api/preferences", preferencesRouter); // ✅ Add this line
app.use("/api/response-status", responseStatusRouter);
 
app.use("/api/analysis", analysisRoutes);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
