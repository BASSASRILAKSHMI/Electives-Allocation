// import express from "express";
// import Student from "../models/Student.js";
// import Admin from "../models/Admin.js";

// import bcrypt from "bcryptjs";

// const router = express.Router();

// // ----------------- STUDENT REGISTER -----------------
// router.post("/register/student", async (req, res) => {
//   try {
//     const { fullName, rollNumber, department, semester, section, email, password } = req.body;

//     // Check if email exists
//     const existingStudent = await Student.findOne({ email });
//     if (existingStudent) return res.status(400).json({ error: "Student already registered" });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const student = new Student({ fullName, rollNumber, department, semester, section, email, password: hashedPassword });
//     await student.save();

//     res.status(201).json({ message: "Student registered successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ----------------- ADMIN REGISTER -----------------
// router.post("/register/admin", async (req, res) => {
//   try {
//     const { facultyId, name, department, email, password } = req.body;

//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) return res.status(400).json({ error: "Admin already registered" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const admin = new Admin({ facultyId, name, department, email, password: hashedPassword });
//     await admin.save();

//     res.status(201).json({ message: "Admin registered successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ----------------- STUDENT LOGIN -----------------
// // ----------------- STUDENT LOGIN -----------------
// router.post("/login/student", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find student
//     const student = await Student.findOne({ email });
//     if (!student)
//       return res.status(400).json({ error: "Student not registered" });

//     // Validate password
//     const isMatch = await bcrypt.compare(password, student.password);
//     if (!isMatch)
//       return res.status(400).json({ error: "Invalid credentials" });

//     // ✅ Send back essential student info for frontend
//     res.json({
//       message: "Student logged in successfully",
//       student: {
//         id: student._id,
//         fullName: student.fullName,
//         rollNumber: student.rollNumber,
//         department: student.department,
//         semester: student.semester,
//         section: student.section,
//         email: student.email,
//       },
//     });
//   } catch (err) {
//     console.error("Student login error:", err);
//     res.status(500).json({ error: "Server error during student login" });
//   }
// });


// // ----------------- ADMIN LOGIN -----------------
// // ----------------- ADMIN LOGIN -----------------
// router.post("/login/admin", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(400).json({ error: "Admin not registered" });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

//     res.json({
//       message: "Admin logged in successfully",
//       admin: {
//         // _id: admin._id,              // ✅ ADD THIS LINE
//         facultyId: admin.facultyId,
//         name: admin.name,
//         department: admin.department,
//         email: admin.email,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });


   

// export default router;
import express from "express";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";


const router = express.Router();

// ----------------- STUDENT LOGIN -----------------
// ----------------- STUDENT LOGIN -----------------
router.post("/login/student", async (req, res) => {
  try {
    const { rollno, password } = req.body;

    const student = await Student.findOne({ rollno });
    if (!student) {
      return res.status(400).json({ error: "Student not registered" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ✅ Create JWT token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Student logged in successfully",
      student: {
        id: student._id,
        name: student.name,
        rollno: student.rollno,
        department: student.department,
        semester: student.semester,
        regulation: student.regulation,
      },
      token, // 🔥 send JWT token
    });
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ error: "Server error during student login" });
  }
});



// ----------------- ADMIN LOGIN -----------------
router.post("/login/admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Admin not registered" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ✅ CREATE TOKEN WITH DEPARTMENT
    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        department: admin.department,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin logged in successfully",
      token, // 🔥 REQUIRED
      admin: {
        facultyId: admin.facultyId,
        name: admin.name,
        department: admin.department,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Server error during admin login" });
  }
});


export default router;
