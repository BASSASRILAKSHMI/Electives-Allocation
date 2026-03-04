import mongoose, { Document, Schema } from "mongoose";

export interface IElective extends Document {
  studentId: mongoose.Types.ObjectId;
  department: string;
  semester: string;
  electives: Record<string, any>; // stores all elective types
}

const electiveSchema = new Schema<IElective>({
  studentId: { type: Schema.Types.ObjectId, ref: "Student" },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  electives: { type: Object, required: true },
});

const Elective = mongoose.model<IElective>("Elective", electiveSchema);

export default Elective;
