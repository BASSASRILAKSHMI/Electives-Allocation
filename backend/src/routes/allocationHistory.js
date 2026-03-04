import express from "express";
import AllocationHistory from "../models/AllocationHistory.js";

const router = express.Router();

// Fetch allocation history for a student
router.get("/:rollno", async (req, res) => {
  try {
    const { rollno } = req.params;

    const history = await AllocationHistory.find({ rollno })
      .sort({ sem: 1 })
      .lean();

    return res.json({ history });
  } catch (err) {
    console.error("Error fetching allocation history:", err);
    res.status(500).json({ error: "Failed to load allocation history" });
  }
});

export default router;
