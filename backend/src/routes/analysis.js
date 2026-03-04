import express from "express";
import Admin from "../models/Admin.js"; 
import Student from "../models/Student.js";
import Elective from "../models/Elective.js";
import AllocationHistory from "../models/AllocationHistory.js";

const router = express.Router();

function getWeight(preference) {
  return 1 / preference;
}

router.get("/:facultyId", async (req, res) => {
  try {
    const { facultyId } = req.params;

    const admin = await Admin.findOne({ facultyId });
    if (!admin)
      return res.status(404).json({ error: "Admin not found. Please log in again." });

    // Get preferences only from this admin’s department
    const preferences = await Preference.find({ dept: admin.department });
    if (preferences.length === 0)
      return res.status(200).json({
        message: "No preferences found for this department.",
        department: admin.department,
        totalPreferences: 0,
        analysis: [],
        allocations: [],
      });

    // -----------------------------
    // STEP 1: Count votes & weights
    // -----------------------------
    const analysisResult = {};
    for (const prefDoc of preferences) {
      const prefGroups = prefDoc.preferences;

      for (const electiveType in prefGroups) {
        if (!analysisResult[electiveType]) analysisResult[electiveType] = {};

        for (const { subject, preference } of prefGroups[electiveType]) {
          if (!analysisResult[electiveType][subject])
            analysisResult[electiveType][subject] = {
              votes: 0,
              weightedScore: 0,
              allocatedStudents: [],
            };

          analysisResult[electiveType][subject].votes++;
          analysisResult[electiveType][subject].weightedScore += getWeight(preference);
        }
      }
    }

    // -----------------------------
    // STEP 2: Compute min requirement
    // -----------------------------
    const totalStudents = preferences.length;
    let totalSubjects = 0;

    for (const electiveType in analysisResult)
      totalSubjects += Object.keys(analysisResult[electiveType]).length;

    const minRequirement = Math.max(1, Math.floor(totalStudents / totalSubjects));

    // -----------------------------
    // STEP 3: Filter qualified electives
    // -----------------------------
    const qualifiedSubjects = {};
    for (const electiveType in analysisResult) {
      qualifiedSubjects[electiveType] = Object.entries(analysisResult[electiveType])
        .filter(([_, data]) => data.votes >= minRequirement)
        .map(([subjectCode, data]) => ({
          subjectCode,
          totalVotes: data.votes,
          weightedScore: data.weightedScore.toFixed(2),
          allocatedStudents: [],
        }));
    }

    // -----------------------------
    // STEP 4: Allocate students
    // -----------------------------
    const allocations = [];

    for (const prefDoc of preferences) {
      const student = await Student.findById(prefDoc.studentId);
      if (!student) continue;

      const allocation = {
  studentId: student._id,
  rollno: student.rollno,
  studentName: student.name,
  dept: student.dept,
  sem: student.sem,
  allocations: {},
};


      for (const electiveType in prefDoc.preferences) {
        const subjects = prefDoc.preferences[electiveType];
        let assigned = null;

        for (const { subject } of subjects.sort((a, b) => a.preference - b.preference)) {
          const qualified = qualifiedSubjects[electiveType]?.map((s) => s.subjectCode) || [];
          if (qualified.includes(subject)) {
            assigned = subject;

            const subj = qualifiedSubjects[electiveType].find(
              (s) => s.subjectCode === subject
            );
            subj?.allocatedStudents.push(student.name);

            break;
          }
        }

        allocation.allocations[electiveType] = assigned || "Not Allocated";
      }

      allocations.push(allocation);
    }

    // -----------------------------
    // STEP 4.5: Replace subject codes with names
    // -----------------------------
    // -----------------------------
// STEP 4.5: Replace subject codes with names (fixed for nested electives structure)
// -----------------------------
const allSubjectCodes = new Set();
for (const alloc of allocations) {
  for (const type in alloc.allocations) {
    if (alloc.allocations[type] !== "Not Allocated") {
      allSubjectCodes.add(alloc.allocations[type]);
    }
  }
}

const electivesMap = {};
if (allSubjectCodes.size > 0) {
  // Fetch all electives in the department
  const electiveDocs = await Elective.find({ dept: admin.department });

  // Build map: subjectCode → subjectName
  // Build map: subjectCode → subjectName
electiveDocs.forEach((doc) => {
  const groups = doc.electives;
  for (const type in groups) {
    groups[type].forEach((subj) => {
      electivesMap[subj.code] = subj.name; // ✅ corrected keys
    });
  }
});


  // Replace subject codes with names in allocations
  allocations.forEach((alloc) => {
    for (const type in alloc.allocations) {
      const code = alloc.allocations[type];
      alloc.allocations[type] = electivesMap[code] || code;
    }
  });
}


    // -----------------------------
    // STEP 5: Prepare response
    // -----------------------------
    const analysis = Object.entries(qualifiedSubjects).map(([electiveType, subjects]) => ({
  electiveType,
  subjects: subjects.map((s) => ({
    subjectCode: s.subjectCode,
    subjectName: electivesMap[s.subjectCode] || s.subjectCode, // ✅ Added name field
    totalVotes: s.totalVotes,
    weightedScore: s.weightedScore,
    allocatedCount: s.allocatedStudents.length,
    allocatedStudents: s.allocatedStudents,
  })),
}));

// -----------------------------
// STEP 6: SAVE ALLOCATIONS TO DATABASE
// -----------------------------
 

// Remove old allocation of this semester before adding new
for (const alloc of allocations) {
  await AllocationHistory.findOneAndDelete({
    studentId: alloc.studentId,
    sem: alloc.sem
  });

  await AllocationHistory.create({
    studentId: alloc.studentId,
    rollno: alloc.rollno,
    sem: alloc.sem,
    allocations: alloc.allocations
  });
}


    res.status(200).json({
      department: admin.department,
      totalPreferences: totalStudents,
      minRequirement,
      analysis,
      allocations,
    });
  } catch (err) {
    console.error("🔥 Error in analysis route:", err);
    res.status(500).json({ error: "Server error while fetching analysis data." });
  }
});

export default router;
