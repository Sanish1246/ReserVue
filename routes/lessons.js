import express from "express";

const router = express.Router();

//GET request to fetch all the lessons
router.get("/lessons", async (req, res) => {
  const db = req.app.locals.db;

  try {
    let lessons = await db.collection("Lessons").find().toArray();
    res.status(200).json(lessons);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ error: "Error fetching lessons" });
  }
});

export default router;
