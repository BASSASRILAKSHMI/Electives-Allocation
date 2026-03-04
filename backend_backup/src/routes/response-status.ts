import express, { Request, Response } from "express";
import ResponseStatus from "../models/ResponseStatus";

const router = express.Router();

/**
 * 🟢 GET — Get all response statuses
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const statuses = await ResponseStatus.find();
    res.json(statuses);
  } catch (error) {
    console.error("GET /response-status error:", error);
    res.status(500).json({ message: "Server error fetching statuses" });
  }
});

/**
 * 🟢 GET — Get specific status for a department (ignores semester)
 */
router.get("/:department", async (req: Request, res: Response) => {
  try {
    const { department } = req.params;

    // ✅ Find the latest status for that department (any semester)
    const status = await ResponseStatus.findOne({ department }).sort({ _id: -1 });

    if (!status) {
      return res.status(404).json({ message: "No status found for this department" });
    }

    res.json(status);
  } catch (error) {
    console.error("GET /response-status/:department error:", error);
    res.status(500).json({ message: "Server error fetching status" });
  }
});

/**
 * 🟡 POST — Create or update response status for entire department (ignores semester)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { department, semester, accepting } = req.body;

    if (!department || typeof accepting !== "boolean") {
      return res.status(400).json({ message: "department and accepting are required" });
    }

    // ✅ Update all semesters of the department at once
    await ResponseStatus.updateMany({ department }, { $set: { accepting } });

    // ✅ If no record exists yet, create one for the given semester
    const existing = await ResponseStatus.findOne({ department });
    if (!existing) {
      await ResponseStatus.create({ department, semester: semester || "All", accepting });
    }

    res.json({
      message: `✅ Response status for ${department} updated to ${accepting ? "ACCEPTING" : "STOPPED"}`,
    });
  } catch (error) {
    console.error("POST /response-status error:", error);
    res.status(500).json({ message: "Server error updating status" });
  }
});

/**
 * 🔴 DELETE — Remove all status records for a department
 */
router.delete("/:department", async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const result = await ResponseStatus.deleteMany({ department });

    if (!result.deletedCount) {
      return res.status(404).json({ message: "No status found for this department" });
    }

    res.json({ message: `🗑️ Deleted all statuses for ${department}` });
  } catch (error) {
    console.error("DELETE /response-status/:department error:", error);
    res.status(500).json({ message: "Server error deleting statuses" });
  }
});

export default router;
