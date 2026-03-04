import express from "express";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";

const router = express.Router();

// Upload Students from Excel
// router.post("/upload-students", async (req, res) => {
//   try {
//     const students = req.body.students;

//     if (!students || students.length === 0)
//       return res.status(400).json({ error: "No student data found" });

//     const formattedStudents = await Promise.all(
//       students.map(async (s) => ({
//         name: s.name?.trim(),
//         rollno: s.rollno.toString().trim(),
//         department: s.department?.trim(),  // ✅ updated
//         semester: s.semester?.toString().trim(),  // ✅ updated
//         regulation: s.regulation?.trim(),
//         password: await bcrypt.hash(s.password.toString(), 10),
//       }))
//     );

//     // Validate required fields
//     const invalid = formattedStudents.find(
//       (s) =>
//         !s.name || !s.rollno || !s.department || !s.semester || !s.regulation
//     );
//     if (invalid)
//       return res
//         .status(400)
//         .json({
//           error: `Student ${invalid.rollno || "N/A"} missing required fields`,
//         });

//     await Student.insertMany(formattedStudents);
//     res.json({ message: "✅ Students uploaded successfully!" });
//   } catch (err) {
//     console.error("Upload Error:", err);
//     res.status(500).json({ error: "Failed to upload students" });
//   }
// });


// Upload Students from Excel
router.post("/upload-students", async (req, res) => {
  try {
    const students = req.body.students;

    if (!students || students.length === 0)
      return res.status(400).json({ error: "No student data found" });

    const formattedStudents = await Promise.all(
      students.map(async (s) => ({
        name: s.name?.trim(),
        rollno: s.rollno.toString().trim(),

        department: s.department?.trim(),
        semester: s.semester?.toString().trim(),
        regulation: s.regulation?.trim(),

        section: s.section?.trim(),      // ✅ NEW

        password: await bcrypt.hash(s.password.toString(), 10),
      }))
    );

    // Validate required fields
    const invalid = formattedStudents.find(
      (s) =>
        !s.name ||
        !s.rollno ||
        !s.department ||
        !s.semester ||
        !s.regulation ||
        !s.section               // ✅
    );

    if (invalid)
      return res.status(400).json({
        error: `Student ${invalid.rollno || "N/A"} missing required fields`,
      });

    await Student.insertMany(formattedStudents);
    res.json({ message: "✅ Students uploaded successfully!" });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Failed to upload students" });
  }
});

export default router;
