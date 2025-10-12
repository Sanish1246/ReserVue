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

//GET request to search in the lessons
router.get("/search/:id", async (req, res) => {
  const db = req.app.locals.db;
  const searchTerm = req.params.id;

  try {
    //Checking if the search term is contained in any of the string fields
    //For string fields, we are using regex and case insensitive search
    let query = {
      $or: [
        { tutor: { $regex: searchTerm, $options: "i" } },
        { subject: { $regex: searchTerm, $options: "i" } },
        { location: { $regex: searchTerm, $options: "i" } },
      ],
    };

    //If the search term is a number, we search for it in the numeric fields
    if (!isNaN(searchTerm)) {
      query.$or.push({ price: Number(searchTerm) });
      query.$or.push({ spaces: Number(searchTerm) });
    }

    let products = await db.collection("Lessons").find(query).toArray();
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ error: "Error fetching lessons" });
  }
});

export default router;
