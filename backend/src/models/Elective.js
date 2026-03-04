import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const ElectiveGroupSchema = new mongoose.Schema(
  {
    electiveGroup: { type: String, required: true }, // PE-1, PE-2, OE
    subjects: { type: [SubjectSchema], required: true },
  },
  { _id: false }
);

const ElectiveSchema = new mongoose.Schema(
  {
    regulation: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: String, required: true },

    electiveGroups: { type: [ElectiveGroupSchema], required: true },

    isActive: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/**
 * VERY IMPORTANT
 * Prevent duplicates
 */
ElectiveSchema.index(
  { regulation: 1, department: 1, semester: 1 },
  { unique: true }
);

export default mongoose.model("Elective", ElectiveSchema);
