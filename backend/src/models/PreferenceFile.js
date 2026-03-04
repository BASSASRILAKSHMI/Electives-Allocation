import mongoose from "mongoose";

const preferenceFileSchema = new mongoose.Schema({
  regulation: String,
  department: String,
  semester: String,
  electiveType: String,
  filename: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("PreferenceFile", preferenceFileSchema);
