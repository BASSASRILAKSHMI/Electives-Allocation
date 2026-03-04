import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import Elective from "../models/Elective.js";
import authAdmin from "../middleware/authAdmin.js";
import ExcelJS from "exceljs";
import StudentPreference from "../models/StudentPreference.js";
import PreferenceFile from "../models/PreferenceFile.js";
import fs from "fs";



const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const REQUIRED_COLUMNS = [
  "Elective Type",
  "Elective Code",
  "Elective Name",
  "Semester",
  "Department",
  "Regulation",
];

// ------------------ UPLOAD EXCEL ------------------

function romanToNumber(r) {
  const map = {
    I: "1",
    II: "2",
    III: "3",
    IV: "4",
    V: "5",
    VI: "6",
    VII: "7",
    VIII: "8",
  };
  return map[r] || r;
}

router.post(
  "/upload",
  authAdmin,
  upload.array("files"),
  async (req, res) => {
    try {
      const adminDept = req.admin.department;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const operations = [];

      for (const file of req.files) {
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) continue;

        const columns = Object.keys(rows[0]);
        for (const col of REQUIRED_COLUMNS) {
          if (!columns.includes(col)) {
            return res.status(400).json({
              message: `Missing column: ${col} in ${file.originalname}`,
            });
          }
        }

        const invalidRow = rows.find((row) => row.Department !== adminDept);
        if (invalidRow) {
          return res.status(403).json({
            message: `Upload denied. File contains department "${invalidRow.Department}" but you belong to "${adminDept}".`,
          });
        }

        const grouped = {};
        for (const row of rows) {
          const key = `${row.Regulation}_${row.Department}_${row.Semester}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(row);
        }

        for (const key in grouped) {
          const groupRows = grouped[key];
          const { Regulation, Department, Semester } = groupRows[0];

          const electiveMap = {};
          for (const r of groupRows) {
            if (!electiveMap[r["Elective Type"]]) {
              electiveMap[r["Elective Type"]] = [];
            }
            electiveMap[r["Elective Type"]].push({
              code: r["Elective Code"],
              name: r["Elective Name"],
            });
          }

          const electiveGroups = Object.keys(electiveMap).map((type) => ({
            electiveGroup: type,
            subjects: electiveMap[type],
          }));

          operations.push(
            Elective.findOneAndUpdate(
              { regulation: Regulation, department: Department, semester: Semester },
              {
                regulation: Regulation,
                department: Department,
                semester: Semester,
                electiveGroups,
                uploadedAt: new Date(),
              },
              { upsert: true, new: true }
            )
          );
        }
      }

      await Promise.all(operations);

      res.json({
        message: "Electives uploaded successfully",
        documentsProcessed: operations.length,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }
);

// ------------------ GET ELECTIVES META ------------------
// ------------------ GET ELECTIVES META ------------------
router.get("/meta", authAdmin, async (req, res) => {
  try {
    const adminDept = req.admin.department;

    const all = await Elective.find(
      { department: adminDept },
      { regulation: 1, department: 1, semester: 1, isActive: 1, _id: 0 }
    ).lean();

    const unique = Array.from(
      new Set(all.map((e) => `${e.regulation}-${e.department}-${e.semester}`))
    ).map((str) => {
      const [regulation, department, semester] = str.split("-");
      const elective = all.find(
        (e) => e.regulation === regulation && e.department === department && e.semester === semester
      );
      return { regulation, department, semester, isActive: elective.isActive || false };
    });

    res.status(200).json(unique);
  } catch (err) {
    console.error("Failed to fetch electives meta", err);
    res.status(500).json({ message: err.message });
  }
});


// ------------------ GET ELECTIVES BY REG/DEPT/SEM ------------------
router.get("/", authAdmin, async (req, res) => {
  try {
    const { regulation, department, semester } = req.query;

    const electives = await Elective.findOne({
      regulation,
      department,
      semester,
    }).lean();

    if (!electives) {
      return res.status(404).json({ message: "Electives not found" });
    }

    res.json(electives);
  } catch (err) {
    console.error("Failed to fetch electives", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ UPDATE SINGLE GROUP ------------------
router.put("/update-group", authAdmin, async (req, res) => {
  try {
    const { regulation, department, semester, groupIndex, group } = req.body;

    const electivesDoc = await Elective.findOne({ regulation, department, semester });
    if (!electivesDoc) return res.status(404).json({ message: "Electives not found" });

    electivesDoc.electiveGroups[groupIndex] = group;
    electivesDoc.updatedAt = new Date();
    await electivesDoc.save();

    res.json({ message: "Group updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update group" });
  }
});

// ------------------ UPDATE ALL ------------------
router.put("/update-all", authAdmin, async (req, res) => {
  try {
    const { regulation, department, semester, electivesData } = req.body;

    const electivesDoc = await Elective.findOne({ regulation, department, semester });
    if (!electivesDoc) return res.status(404).json({ message: "Electives not found" });

    electivesDoc.electiveGroups = electivesData.electiveGroups;
    electivesDoc.updatedAt = new Date();
    await electivesDoc.save();

    res.json({ message: "All electives updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update electives" });
  }
});


// ------------------ CIRCULATE ELECTIVES ------------------
router.post("/circulate", authAdmin, async (req, res) => {
  try {
    const { selected } = req.body;

    if (!selected || !Array.isArray(selected) || selected.length === 0) {
      return res.status(400).json({ message: "No electives selected" });
    }

    // Loop through selected regulation-department-semester strings
    for (let item of selected) {
      const [regulation, department, semester] = item.split("-");
      await Elective.findOneAndUpdate(
        { regulation, department, semester },
        { isActive: true }
      );
    }

    res.json({ message: "Electives circulated successfully!" });
  } catch (err) {
    console.error("Circulation Error:", err);
    res.status(500).json({ message: "Failed to circulate electives" });
  }
});

// ------------------ STOP ELECTIVES CIRCULATION ------------------
// router.post("/stop-circulation", authAdmin, async (req, res) => {
//   try {
//     const { selected } = req.body;

//     if (!selected || !Array.isArray(selected) || selected.length === 0) {
//       return res.status(400).json({ message: "No electives selected" });
//     }

//     for (let item of selected) {
//       const [regulation, department, semester] = item.split("-");
//       await Elective.findOneAndUpdate(
//         { regulation, department, semester },
//         { isActive: false }
//       );
//     }

//     res.json({ message: "Electives circulation stopped successfully!" });
//   } catch (err) {
//     console.error("Stop Circulation Error:", err);
//     res.status(500).json({ message: "Failed to stop electives circulation" });
//   }
// });


router.post("/stop-circulation", authAdmin, async (req, res) => {
  try {
    const { selected } = req.body;

    for (let item of selected) {

      const [regulation, department, semesterRoman] = item.split("-");
      const semester = romanToNumber(semesterRoman);

      // 1️⃣ Stop circulation
      await Elective.findOneAndUpdate(
        { regulation, department, semester: semesterRoman },
        { isActive: false }
      );

      // 2️⃣ Fetch student preferences
      const prefs = await StudentPreference.find({
  regulation,
  department,
  semester
}).populate("student", "section");


      if (prefs.length === 0) continue;

      // 3️⃣ Get elective structure
      const electiveDoc = await Elective.findOne({
        regulation,
        department,
        semester: semesterRoman
      });

      const groups = electiveDoc.electiveGroups;

      // 4️⃣ Create Excel per Elective Type
      for (let group of groups) {

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Preferences");

        // How many preferences needed?
        const prefCount = group.subjects.length;

        // Dynamic columns
        const columns = [
  { header: "Timestamp", key: "time" },
  { header: "Roll No", key: "roll" },
  { header: "Section", key: "section" }
];

        for (let i = 1; i <= prefCount; i++) {
          columns.push({ header: `Preference-${i}`, key: `p${i}` });
        }

        columns.push(
          { header: "Department", key: "dept" },
          { header: "Semester", key: "sem" },
          { header: "Regulation", key: "reg" }
        );

        sheet.columns = columns;
        prefs.sort((a, b) => a.rollno.localeCompare(b.rollno));

        // 5️⃣ Build rows
        // Build code → name mapping
const codeNameMap = {};
group.subjects.forEach(sub => {
  codeNameMap[sub.code] = sub.name;
});

// Build rows
prefs.forEach(p => {

  const studentGroupPrefs = p.preferences[group.electiveGroup];
  if (!studentGroupPrefs) return;

  const sorted = Object.entries(studentGroupPrefs)
    .sort((a, b) => a[1] - b[1]);

  const row = {
    time: p.createdAt,
    roll: p.rollno,
    section: p.student?.section || "",
    dept: p.department,
    sem: p.semester,
    reg: p.regulation
  };

  sorted.forEach(([code], index) => {
    const electiveName = codeNameMap[code] || "";
    row[`p${index + 1}`] = `${electiveName} (${code})`;
  });

  sheet.addRow(row);
});


        const safeGroup = group.electiveGroup.replace(/\s+/g, "_");

        const filename =
          `${regulation}-${department}-${semesterRoman}-${safeGroup}.xlsx`;

        const path = `./src/uploads/${filename}`;

        if (fs.existsSync(path)) {
  fs.unlinkSync(path);
}

await workbook.xlsx.writeFile(path);


        // Save metadata
        await PreferenceFile.findOneAndUpdate(
  {
    regulation,
    department,
    semester: semesterRoman,
    electiveType: group.electiveGroup,   // ✅
    filename
  },
  {
    regulation,
    department,
    semester: semesterRoman,
    electiveType: group.electiveGroup,   // ✅
    filename
  },
  { upsert: true }
);

      }
    }

    res.json({ message: "Stopped & Excel Files Generated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to stop circulation" });
  }
});




router.get("/preference-files", authAdmin, async (req, res) => {
  const files = await PreferenceFile.find().sort({ createdAt: -1 });
  res.json(files);
});

// ------------------ ANALYZE SINGLE PREFERENCE FILE ------------------

// ======================================================
// GET PREFERENCE-1 DATA FOR A FILE
// ======================================================
// GET PREFERENCE-1 DATA FOR A FILE
// ======================================================

// ======================================================
// GET PREFERENCE-1 DATA FOR A FILE (CORRECT VERSION)
// ======================================================
// ======================================================
// GET PREFERENCE-1 DATA FOR A FILE (NAME + CODE)
// ======================================================

router.get("/file-preferences/:fileId", authAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;

    // 1️⃣ Find file metadata
    const file = await PreferenceFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // 2️⃣ Roman → Number
    const romanToNumber = (r) => {
      const map = {
        I: 1,
        II: 2,
        III: 3,
        IV: 4,
        V: 5,
        VI: 6,
        VII: 7,
        VIII: 8,
      };
      return map[r] || r;
    };

    const semesterNumber = romanToNumber(file.semester);

    // 3️⃣ Fetch students
    const students = await StudentPreference.find({
      regulation: file.regulation,
      department: file.department,
      semester: semesterNumber,
    });

    // 4️⃣ Fetch elective structure
    const electiveDoc = await Elective.findOne({
      regulation: file.regulation,
      department: file.department,
      semester: file.semester,
    });

    const group = electiveDoc.electiveGroups.find(
      (g) => g.electiveGroup === file.electiveType
    );

    // 5️⃣ Build code → name map
    const codeNameMap = {};
    group.subjects.forEach((sub) => {
      codeNameMap[sub.code] = sub.name;
    });

    // 6️⃣ Extract preference-1
    const result = [];

    students.forEach((s) => {
      const groupPrefs = s.preferences?.[file.electiveType];
      if (!groupPrefs) return;

      for (let code in groupPrefs) {
        if (groupPrefs[code] === 1) {
          const name = codeNameMap[code] || "";
          result.push({
            preference1: `${name} (${code})`,
          });
        }
      }
    });

    res.json(result);

  } catch (error) {
    console.error("File preference error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/master", async (req, res) => {
  try {
    const { regulation, department, semester, electiveGroup } = req.query;

    const doc = await Elective.findOne({
      regulation,
      department,
      semester
    });

    if (!doc) {
      return res.json([]);
    }

    const group = doc.electiveGroups.find(
      (g) => g.electiveGroup === electiveGroup
    );

    if (!group) {
      return res.json([]);
    }

    res.json(group.subjects);   // 👈 return subjects array
  } catch (error) {
    console.error("MASTER ELECTIVES ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


export default router;
