import express from "express";
import Student from "../models/Student";
import Preference from "../models/Preference";

const router = express.Router();

// 📥 POST /api/preferences/submit
router.post("/submit", async (req, res) => {
  try {
    let { rollOrEmail, preferences } = req.body;

    if (!rollOrEmail || !preferences) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    rollOrEmail = rollOrEmail.trim().toLowerCase();

    // 🧠 Find student by roll number or email (case-insensitive)
    const student = await Student.findOne({
      $or: [
        { email: rollOrEmail },
        { rollNumber: rollOrEmail },
      ],
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // 🧠 Prevent duplicate submission
    const existing = await Preference.findOne({
      studentId: student._id,
      department: student.department,
      semester: student.semester,
    });

    if (existing) {
      return res.status(400).json({
        message: "Preferences already submitted for this student.",
      });
    }

    // 🆕 Create preference record
    await Preference.create({
      studentId: student._id,
      department: student.department,
      semester: student.semester,
      preferences,
    });

    res.json({ message: "✅ Preferences submitted successfully!" });
  } catch (err) {
    console.error("Error submitting preferences:", err);
    res.status(500).json({ error: "Failed to submit preferences" });
  }
});

export default router;
