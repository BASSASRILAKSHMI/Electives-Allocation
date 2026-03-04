import mongoose from "mongoose";

const detainedSchema = new mongoose.Schema({
  rollno: String,
  name: String,
  dept: String,
  sem: String,
});

export default mongoose.model("Detained", detainedSchema);
