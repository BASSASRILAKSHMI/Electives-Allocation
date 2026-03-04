import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  facultyId: string;
  name: string;
  department: string;
  email: string;
  password: string;
}

const adminSchema = new Schema<IAdmin>({
  facultyId: { type: String, required: true, unique: true }, // made unique
  name: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true }); // added timestamps

// Prevent model overwrite in Next.js hot reload
export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", adminSchema);
