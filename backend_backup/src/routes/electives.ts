import express from "express";
import Elective from "../models/Elective";
import Student from "../models/Student";

const router = express.Router();

const departmentMap: Record<string, string> = {
  "Computer Science and Engineering": "CSE",
  "Information Technology": "IT",
  "Electronics and Communication Engineering": "ECE",
  "Electrical and Electronics Engineering": "EEE",
  "Mechanical Engineering": "MECH",
  "Civil Engineering": "CIVIL",
  "Artificial Intelligence and Data Science": "AIDS",
  "Artificial Intelligence and Machine Learning": "AIML",
  "Chemical Engineering": "CHE",
  "Biotechnology": "BIOTECH",
  "Master of Computer Applications": "MCA",
  "Master of Business Administration": "MBA",
  "Internet of Things": "IOT",
};

// 📦 POST /api/electives/upload
router.post("/upload", async (req, res) => {
  try {
    const { groupedData } = req.body;
    if (!groupedData || Object.keys(groupedData).length === 0) {
      return res.status(400).json({ error: "No grouped data received" });
    }

    let totalStudentsUpdated = 0;
    let skippedDuplicates = 0;

    for (const dept in groupedData) {
      const normalizedDept = departmentMap[dept.trim()] || dept.trim();
      const semesters = groupedData[dept];

      for (const sem in semesters) {
        const electives = semesters[sem];

        const students = await Student.find({
          department: normalizedDept,
          semester: sem,
        });

        if (students.length === 0) {
          console.log(`⚠️ No students found for ${normalizedDept} - Sem ${sem}`);
          continue;
        }

        for (const student of students) {
          // 🧠 Check for existing record
          const exists = await Elective.findOne({
            studentId: student._id,
            department: normalizedDept,
            semester: sem,
          });

          if (exists) {
            skippedDuplicates++;
            continue; // skip duplicate
          }

          // 🆕 Only create if not already present
          await Elective.create({
            studentId: student._id,
            department: normalizedDept,
            semester: sem,
            electives,
          });
          totalStudentsUpdated++;
        }
      }
    }

    res.json({
      message: `✅ ${totalStudentsUpdated} new electives uploaded successfully.`,
      skippedDuplicates: `⚠️ ${skippedDuplicates} duplicate records skipped.`,
    });
  } catch (err) {
    console.error("Error saving electives:", err);
    res.status(500).json({ error: "Failed to upload electives" });
  }
});

// 🎓 GET /api/electives/student/:email
// 🎓 GET /api/electives/student/:email
// 🎓 GET /api/electives/student/:emailOrRoll
router.get("/student/:emailOrRoll", async (req, res) => {
  try {
    const { emailOrRoll } = req.params;
    const normalized = emailOrRoll.trim().toLowerCase();

    // 🧠 Find student by either email or roll number
    const student = await Student.findOne({
      $or: [
        { email: normalized },
        { rollNumber: normalized },
      ],
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // 🧩 Match department and semester exactly
    const electives = await Elective.aggregate([
      {
        $match: {
          department: student.department,
          semester: student.semester,
        },
      },
      {
        $group: {
          _id: {
            department: "$department",
            semester: "$semester",
          },
          electives: { $first: "$electives" },
        },
      },
      {
        $project: {
          _id: 0,
          department: "$_id.department",
          semester: "$_id.semester",
          electives: 1,
        },
      },
    ]);

    if (!electives || electives.length === 0) {
      return res.status(404).json({
        message: "No electives found for your department and semester",
      });
    }

    res.json({
      message: `🎓 Electives for ${student.department} - Sem ${student.semester}`,
      electives,
    });
  } catch (err) {
    console.error("Error fetching student electives:", err);
    res.status(500).json({ error: "Server error while fetching electives" });
  }
});


export default router;
