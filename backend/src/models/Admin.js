import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite
const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;
