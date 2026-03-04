import express from "express";
import Elective from "../models/Elective.js";
import authStudent from "../middleware/authStudent.js";
import StudentPreference from "../models/StudentPreference.js";
import Allocation from "../models/Allocation.js";



const router = express.Router();

// 🔥 Helper function: convert number string to Roman numeral
function numberToRoman(num) {
  const romans = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
  };
  return romans[Number(num)] || num; // fallback: return original if not found
}

// ------------------ GET STUDENT ELECTIVES ------------------
router.get("/", authStudent, async (req, res) => {
  try {
    const student = req.student;
    const semesterRoman = numberToRoman(student.semester);

    const electives = await Elective.findOne({
      regulation: student.regulation,
      department: student.department,
      semester: semesterRoman,
      isActive: true,
    });

    const alreadySubmitted = await StudentPreference.findOne({
      student: student._id,
    });

    // ✅ Fetch allocated electives for this student
    const allocatedElectives = await Allocation.find({
      student: student._id,
    });

    res.json({
      student: {
        name: student.name,
        rollno: student.rollno,
        department: student.department,
        semester: student.semester,
        regulation: student.regulation,
      },
      electives: electives ? electives.electiveGroups : null,
      alreadySubmitted: !!alreadySubmitted,
      allocatedElectives, // 👈 NEW FIELD
    });
  } catch (err) {
    console.error("ERROR 👉", err);
    res.status(500).json({ message: "Failed to fetch electives" });
  }
});



// ------------------ SUBMIT STUDENT PREFERENCES ------------------
router.post("/preferences", authStudent, async (req, res) => {
  try {
    console.log("REQ BODY 👉", req.body);
    console.log("STUDENT 👉", req.student);

    const { preferences } = req.body;

    if (!preferences || Object.keys(preferences).length === 0) {
      return res.status(400).json({ message: "Preferences are required" });
    }

    // 🔁 Prevent duplicate submission
    const alreadySubmitted = await StudentPreference.findOne({
      student: req.student._id,
    });

    if (alreadySubmitted) {
      return res
        .status(400)
        .json({ message: "Preferences already submitted" });
    }

    await StudentPreference.create({
  student: req.student._id,
  rollno: req.student.rollno,
  department: req.student.department,
  semester: req.student.semester,
  regulation: req.student.regulation,
  preferences,
});


    res.status(200).json({ message: "Preferences submitted successfully" });
  } catch (err) {
    console.error("SUBMIT ERROR 👉", err);
    res.status(500).json({ message: "Failed to submit preferences" });
  }
});


export default router;

 