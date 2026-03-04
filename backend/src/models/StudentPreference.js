// import mongoose from "mongoose";

// const studentPreferenceSchema = new mongoose.Schema(
//   {
//     student: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Student",
//       required: true,
//       unique: true
//     },
//     preferences: {
//       type: Object, // 🔥 group-wise object
//       required: true
//     }
//   },
//   { timestamps: true }
// );


// export default mongoose.model("StudentPreference", studentPreferenceSchema);


// import mongoose from "mongoose";

// const studentPreferenceSchema = new mongoose.Schema(
//   {
//     student: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Student",
//       required: true,
//       unique: true
//     },

//     rollno: String,
//     department: String,
//     semester: String,
//     regulation: String,

//     preferences: {
//       type: Object,
//       required: true
//     }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("StudentPreference", studentPreferenceSchema);



import mongoose from "mongoose";

const studentPreferenceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },

    rollno: String,
    department: String,
    semester: String,
    regulation: String,

    section: String,   // ✅ NEW

    preferences: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true } // gives createdAt
);

export default mongoose.model("StudentPreference", studentPreferenceSchema);
