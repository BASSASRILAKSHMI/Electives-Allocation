// import express from "express";
// import Student from "../models/Student.js";

// const router = express.Router();

// router.post("/", async (req, res) => {
//   try {
//     const { department, semester } = req.body;
//     const currentSem = parseInt(semester);

//     const maxSemesters = { BTECH: 8, MCA: 4, MBA: 4 };
//     const degreeType = ["MCA", "MBA"].includes(department) ? "MCA" : "BTECH";
//     const maxSem = maxSemesters[degreeType];

//     // Promote or mark completed
//     let updateResult;
//     if (currentSem >= maxSem) {
//       updateResult = await Student.updateMany(
//         { dept: department, sem: semester.toString() },
//         { $set: { sem: "Completed" } }
//       );
//     } else {
//       const nextSem = currentSem + 1;
//       updateResult = await Student.updateMany(
//         { dept: department, sem: semester.toString() },
//         { $set: { sem: `${nextSem}` } }
//       );
//     }

//     if (updateResult.modifiedCount === 0) {
//       return res.json({
//         success: false,
//         message: `No students found in ${department} Sem ${semester}`,
//       });
//     }

//     res.json({
//       success: true,
//       message:
//         currentSem >= maxSem
//           ? `${department} Sem ${semester} students marked as Completed.`
//           : `${department} Sem ${semester} promoted to Sem ${currentSem + 1}.`,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error promoting students" });
//   }
// });

// export default router;


import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import Student from "../models/Student.js";
import Detained from "../models/Detained.js";

const router = express.Router();

// multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { department, semester } = req.body;
    const currentSem = parseInt(semester);

    let detainedRollNos = [];

    // If file uploaded, parse detained students
    if (req.file) {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      detainedRollNos = sheet.map((row) => row.rollno?.toString().trim());

      // Save detained to DB
      await Detained.insertMany(
        sheet.map((row) => ({
          rollno: row.rollno,
          name: row.name,
          dept: department,
          sem: semester,
        }))
      );
    }

    const degreeType = ["MCA", "MBA"].includes(department) ? "MCA" : "BTECH";
    const maxSemesters = { BTECH: 8, MCA: 4, MBA: 4 };
    const maxSem = maxSemesters[degreeType];

    let updateResult;

    // Final sem → mark completed (except detained)
    if (currentSem >= maxSem) {
      updateResult = await Student.updateMany(
        {
          dept: department,
          sem: semester,
          rollno: { $nin: detainedRollNos }
        },
        { $set: { sem: "Completed" } }
      );
    } 
    else {
      const nextSem = currentSem + 1;

      updateResult = await Student.updateMany(
        {
          dept: department,
          sem: semester,
          rollno: { $nin: detainedRollNos }
        },
        { $set: { sem: `${nextSem}` } }
      );
    }

    res.json({
      success: true,
      message: `Promotion completed.
      Promoted: ${updateResult.modifiedCount}
      Detained: ${detainedRollNos.length}`,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error promoting students" });
  }
});

export default router;
