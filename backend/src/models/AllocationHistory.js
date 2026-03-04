import mongoose from "mongoose";

const { Schema } = mongoose;

const allocationHistorySchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  rollno: { type: String, required: true },
  sem: { type: String, required: true },

  // Stores all electives allocated for that semester
  allocations: { type: Object, required: true },

  allocatedAt: { type: Date, default: Date.now }
});

const AllocationHistory =
  mongoose.models.AllocationHistory ||
  mongoose.model("AllocationHistory", allocationHistorySchema);

export default AllocationHistory;
