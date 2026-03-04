import mongoose from "mongoose";

const { Schema } = mongoose;

const responseStatusSchema = new Schema({
  department: { type: String, required: true },
  semester: { type: String, required: true },
  accepting: { type: Boolean, default: true },
});

const ResponseStatus =
  mongoose.models.ResponseStatus ||
  mongoose.model("ResponseStatus", responseStatusSchema);

export default ResponseStatus;
