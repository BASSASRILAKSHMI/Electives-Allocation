import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  fullName: string;
  rollNumber: string;
  department: string;
  semester: string;
  section: string;
  email: string;
  password: string;
}

const studentSchema = new Schema<IStudent>({
  fullName: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  section: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export default mongoose.model<IStudent>("Student", studentSchema);
