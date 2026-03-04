// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const studentSchema = new Schema({
//   fullName: { type: String, required: true },
//   rollNumber: { type: String, required: true, unique: true },
//   department: { type: String, required: true },
//   semester: { type: String, required: true },
//   section: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const Student =
//   mongoose.models.Student || mongoose.model("Student", studentSchema);

// export default Student;
// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const studentSchema = new Schema({
//   name: { type: String, required: true },
//   rollno: { type: String, required: true, unique: true },

//   department: { type: String, required: true }, // ✅ renamed
//   semester: { type: String, required: true },   // ✅ renamed

//   regulation: { type: String, required: true },
//   password: { type: String, required: true },
// });

// const Student =
//   mongoose.models.Student || mongoose.model("Student", studentSchema);

// export default Student; 


import mongoose from "mongoose";

const { Schema } = mongoose;

const studentSchema = new Schema({
  name: { type: String, required: true },

  rollno: { type: String, required: true, unique: true },

  department: { type: String, required: true },

  semester: { type: String, required: true },

  regulation: { type: String, required: true },

  section: { type: String, required: true },   // ✅ NEW FIELD

  password: { type: String, required: true },
});

const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;
