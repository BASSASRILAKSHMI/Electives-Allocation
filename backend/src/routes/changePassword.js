import express from "express";
import bcrypt from "bcrypt";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";

const router = express.Router();

// POST /api/change-password
router.post("/", async (req, res) => {
  try {
    const { role, identifier, newPassword } = req.body; 
    // role = "student" or "admin"
    // identifier = rollno (for student) or email (for admin)
    if (!role || !identifier || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (role === "student") {
      const student = await Student.findOneAndUpdate(
        { rollno: identifier },
        { password: hashedPassword },
        { new: true }
      );
      if (!student) return res.status(404).json({ error: "Student not found" });

      return res.status(200).json({ message: "Password updated successfully" });
    } else if (role === "admin") {
      const admin = await Admin.findOneAndUpdate(
        { email: identifier },
        { password: hashedPassword },
        { new: true }
      );
      if (!admin) return res.status(404).json({ error: "Admin not found" });

      return res.status(200).json({ message: "Password updated successfully" });
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
