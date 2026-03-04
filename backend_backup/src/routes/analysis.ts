import express from "express";
import Preference from "../models/Preference";
import Elective from "../models/Elective";

const router = express.Router();
router.get("/", (req, res) => {
  res.send("✅ Analysis route root working");
});

// ✅ Run analysis for the given department
router.get("/:department", async (req: any, res) => {
  try {
    console.log("✅ Analysis API called for department:", req.params.department); // <-- ✅ Place here

    const adminDept = req.params.department;
    if (!adminDept) return res.status(400).json({ message: "Department required" });

    // 🧩 Get all semesters for this department
    const semesters = await Preference.distinct("semester", { department: adminDept });
    if (!semesters.length) {
      return res.status(404).json({ message: "No responses found for this department" });
    }

    const allResults: Record<string, any> = {};

    for (const sem of semesters) {
      const prefs = await Preference.find({ department: adminDept, semester: sem }).lean();
      const electiveGroups = new Set<string>();
      prefs.forEach((p) => Object.keys(p.preferences).forEach((e) => electiveGroups.add(e)));

      const semResults: Record<string, any> = {};

      for (const electiveGroup of electiveGroups) {
        const allChoices: any[] = [];

        prefs.forEach((p) => {
          const studentPrefs = p.preferences[electiveGroup];
          if (studentPrefs) {
            allChoices.push({
              studentId: p.studentId.toString(),
              department: p.department,
              semester: p.semester,
              choices: studentPrefs.sort((a: any, b: any) => a.preference - b.preference),
            });
          }
        });

        if (!allChoices.length) continue;

        const electives = await Elective.find({ department: adminDept }).lean();
        const subjectNameMap: Record<string, string> = {};
        electives.forEach((e) => {
          Object.values(e.electives || {}).forEach((group: any) => {
            group.forEach((el: any) => {
              subjectNameMap[el.code] = el.name || el.code;
            });
          });
        });

        const subjectIds = [
          ...new Set(allChoices.flatMap((c) => c.choices.map((ch: any) => ch.subject))),
        ];
        const totalStudents = allChoices.length;
        const numSubjects = subjectIds.length;
        const minPer = Math.max(1, Math.floor(totalStudents / numSubjects));

        const config: Record<string, { min: number }> = {};
        subjectIds.forEach((id) => (config[id] = { min: minPer }));

        allChoices.sort(() => Math.random() - 0.5);
        const assignments: Record<string, string> = {};

        for (const s of allChoices) {
          for (const pref of s.choices) {
            if (config[pref.subject]) {
              assignments[s.studentId] = pref.subject;
              break;
            }
          }
        }

        const counts: Record<string, number> = {};
        Object.values(assignments).forEach((sub) => {
          counts[sub] = (counts[sub] || 0) + 1;
        });

        const summary = Object.entries(counts).map(([subId, count]) => ({
          subjectCode: subId,
          subjectName: subjectNameMap[subId] || subId,
          assigned: count,
          minRequired: config[subId].min,
          metMin: count >= config[subId].min,
        }));

        const satisfaction =
          (Object.entries(assignments).filter(([sid, sub]) => {
            const student = allChoices.find((s) => s.studentId === sid);
            return student?.choices?.[0]?.subject === sub;
          }).length /
            totalStudents) *
          100;

        semResults[electiveGroup] = {
          totalStudents,
          satisfaction: satisfaction.toFixed(1),
          summary,
        };
      }

      allResults[sem] = semResults;
    }

    // ✅ Send JSON response instead of rendering HTML
    res.json({ department: adminDept, analysisResult: allResults });
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ error: "Server error during analysis" });
  }
});

export default router;
