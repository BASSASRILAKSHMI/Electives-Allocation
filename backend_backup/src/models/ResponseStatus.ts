import mongoose, { Document, Schema } from "mongoose";

export interface IResponseStatus extends Document {
  department: string;
  semester: string;
  accepting: boolean; // true = accepting responses, false = stopped
}

const responseStatusSchema = new Schema<IResponseStatus>({
  department: { type: String, required: true },
  semester: { type: String, required: true },
  accepting: { type: Boolean, default: true },
});

export default mongoose.model<IResponseStatus>(
  "ResponseStatus",
  responseStatusSchema
);
