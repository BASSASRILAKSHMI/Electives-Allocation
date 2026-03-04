import mongoose, { Document, Schema } from "mongoose";

export interface IPreference extends Document {
  studentId: mongoose.Types.ObjectId;
  department: string;
  semester: string;
  preferences: Record<string, any>; // e.g., { "Professional Elective - 2": [{subject: "Cyber Security", preference: 1}, ...] }
}

const preferenceSchema = new Schema<IPreference>({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  preferences: { type: Object, required: true },
});

export default mongoose.model<IPreference>("Preference", preferenceSchema);
