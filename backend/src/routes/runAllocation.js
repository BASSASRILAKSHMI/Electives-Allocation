import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import PreferenceFile from "../models/PreferenceFile.js";
import StudentPreference from "../models/StudentPreference.js";
import Elective from "../models/Elective.js";
import Allocation from "../models/Allocation.js";
import ExcelJS from "exceljs";

const router = express.Router();

/* =====================================================
   RUN ALLOCATION
===================================================== */
router.post("/run-allocation", authAdmin, async (req, res) => {
  try {
    const { allocations } = req.body;

    if (!allocations || allocations.length === 0) {
      return res.status(400).json({ message: "No allocation data provided" });
    }

    // Roman → Number map for StudentPreference query
    const romanToNumber = {
      I: "1",
      II: "2",
      III: "3",
      IV: "4",
      V: "5",
      VI: "6",
      VII: "7",
      VIII: "8"
    };

    for (const item of allocations) {
      const { fileId, selectedElectives } = item;
      if (!fileId || !selectedElectives || selectedElectives.length === 0) continue;

      const file = await PreferenceFile.findById(fileId);
      if (!file) continue;

      const { regulation, department, semester: fileSemester, electiveType } = file;

      // normalizedSemester used for StudentPreference query
      const normalizedSemester = romanToNumber[fileSemester.toUpperCase()] || fileSemester;

      // Remove old allocations for this file
      await Allocation.deleteMany({ fileId });

      // Fetch students who have submitted preferences
      const students = await StudentPreference.find({
        regulation,
        department,
        semester: normalizedSemester
      }).populate("student", "rollno name semester department");

      if (!students.length) {
        console.log(`No students found for ${electiveType}`);
        continue;
      }

      // Fetch master elective document using original semester (Roman numeral)
      const electiveDoc = await Elective.findOne({
        regulation,
        department,
        semester: fileSemester
      });

      if (!electiveDoc) {
        console.log("No Elective doc found for:", regulation, department, fileSemester);
        continue;
      }

      // Find the specific elective group
      const group = electiveDoc.electiveGroups?.find(
        g => g.electiveGroup === electiveType
      );

      if (!group) {
        console.log("No elective group found:", electiveType);
        continue;
      }

      // Map code → name for this elective group
      const codeNameMap = {};
      group.subjects.forEach(s => codeNameMap[s.code] = s.name);

      // Track section counts
      // Track section counts
const sectionCount = {};
selectedElectives.forEach(code => sectionCount[code] = 1);

// Allocate students based on preferences
for (const sp of students) {
  if (!sp.student) continue;

  const prefs = sp.preferences?.[electiveType]; // "Professional Elective - 4" etc.
  if (!prefs) continue;

  // Sort preferences by rank (lower number = higher preference)
  const sorted = Object.entries(prefs).sort((a, b) => a[1] - b[1]);

  for (const [code] of sorted) {
    if (!selectedElectives.includes(code)) continue;

    // Create allocation with IT-1 style section
    await Allocation.create({
      fileId,
      student: sp.student._id,
      regulation,
      department,
      semester: normalizedSemester,
      electiveType,
      allocatedElective: {
        code,
        name: codeNameMap[code]
      },
      section: `${department}-${sectionCount[code]}` // ✅ IT-1, IT-2 etc.
    });

    console.log(
      `Allocated ${codeNameMap[code]} (${code}) to student ${sp.student.rollno}, section ${department}-${sectionCount[code]}`
    );

    sectionCount[code] += 1;
    break; // move to next student
  }
}

    }

    res.json({ message: "Allocation stored successfully" });

  } catch (err) {
    console.error("RUN ALLOCATION ERROR:", err);
    res.status(500).json({ message: "Allocation failed" });
  }
});
/* =====================================================
   DOWNLOAD EXCEL
===================================================== */
router.get("/allocations/:fileId/download", authAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Fetch allocations
    const allocations = await Allocation.find({ fileId })
      .populate("student", "rollno name semester department")
      .lean();

    if (!allocations || allocations.length === 0) {
      return res.status(400).json({ message: "No allocations found" });
    }

    // Fetch PreferenceFile to get regulation, department, semester, electiveType
    const file = await PreferenceFile.findById(fileId);
    if (!file) {
      return res.status(400).json({ message: "Preference file not found" });
    }

    const { regulation, department, semester, electiveType } = file;

    // Build safe dynamic filename
    const safeElectiveType = electiveType.replace(/[^\w-]/g, "-");
    const safeRegulation = String(regulation).replace(/[^\w-]/g, "-");
    const safeDepartment = String(department).replace(/[^\w-]/g, "-");
    const safeSemester = String(semester).replace(/[^\w-]/g, "-");

    const filename = `${safeRegulation}-${safeDepartment}-${safeSemester}-${safeElectiveType}.xlsx`;

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Allocation");

    sheet.columns = [
      { header: "Roll No", key: "rollno", width: 15 },
      { header: "Name", key: "name", width: 25 },
      { header: "Semester", key: "semester", width: 10 },
      { header: "Department", key: "department", width: 15 },
      { header: "Section", key: "section", width: 10 },
      { header: "Elective", key: "elective", width: 35 } // wider for name + code
    ];

    allocations.forEach(a => {
      sheet.addRow({
        rollno: a.student?.rollno || "",
        name: a.student?.name || "",
        semester: a.student?.semester || "",
        department: a.student?.department || "",
        section: a.section || "",
        elective: a.allocatedElective
          ? `${a.allocatedElective.name} (${a.allocatedElective.code})`
          : ""
      });
    });

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("EXCEL ERROR:", err);
    res.status(500).json({ message: "Excel generation failed" });
  }
});

router.get("/allocations/check/:fileId", authAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;

    const allocationExists = await Allocation.exists({ fileId });

    res.json({ exists: !!allocationExists }); // true if allocations exist, false otherwise
  } catch (err) {
    console.error("CHECK ALLOCATION ERROR:", err);
    res.status(500).json({ message: "Failed to check allocation" });
  }
});


export default router;
