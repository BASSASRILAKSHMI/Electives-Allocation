import mongoose from "mongoose";

const AllocationSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PreferenceFile",
      required: true
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    regulation: String,
    department: String,
    semester: String,
    electiveType: String,

    allocatedElective: {
      code: String,
      name: String
    },

    section: {
  type: String, // <-- change from Number to String
  required: true
}

  },
  { timestamps: true }
);

export default mongoose.model("Allocation", AllocationSchema);
