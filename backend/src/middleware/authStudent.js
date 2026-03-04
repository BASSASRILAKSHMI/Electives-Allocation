import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const authStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const student = await Student.findById(decoded.id);

    if (!student) {
      return res.status(401).json({ message: "Student not found" });
    }

    req.student = student; // 🔥 THIS IS CRITICAL
    next();
  } catch (err) {
    console.error("AUTH ERROR", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authStudent;
