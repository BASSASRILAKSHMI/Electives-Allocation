import express from "express";
import Student from "../models/Student";
import Admin from "../models/Admin";
import bcrypt from "bcryptjs";

const router = express.Router();

// ----------------- STUDENT REGISTER -----------------
router.post("/register/student", async (req, res) => {
  try {
    const { fullName, rollNumber, department, semester, section, email, password } = req.body;

    // Check if email exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) return res.status(400).json({ error: "Student already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({ fullName, rollNumber, department, semester, section, email, password: hashedPassword });
    await student.save();

    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- ADMIN REGISTER -----------------
router.post("/register/admin", async (req, res) => {
  try {
    const { facultyId, name, department, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ error: "Admin already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({ facultyId, name, department, email, password: hashedPassword });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- STUDENT LOGIN -----------------
router.post("/login/student", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ error: "Student not registered" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({ message: "Student logged in successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- ADMIN LOGIN -----------------
router.post("/login/admin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Admin not registered" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
  message: "Admin logged in successfully",
  admin: {
    facultyId: admin.facultyId,
    name: admin.name,
    department: admin.department,
    email: admin.email,
  },
});

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
