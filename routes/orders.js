import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

//POST request to update the orders collection
router.post("/order", async (req, res) => {
  const order = req.body;
  const db = req.app.locals.db;

  try {
    const result = await db.collection("Orders").insertOne(order);

    res.status(201).json({
      message: "Order completed successfully",
      orderId: result.insertedId.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

//PUT request to permanently update the lessons spaces after checkout
router.put("/order/:orderId/update", async (req, res) => {
  const { orderId } = req.params;
  const db = req.app.locals.db;

  try {
    // Getting the order to retrieve lessons that need to be updated
    const order = await db.collection("Orders").findOne({
      _id: new ObjectId(orderId),
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update spaces for each lesson in the order with the exact value
    const updatePromises = order.lessons.map((lesson) =>
      db
        .collection("Lessons")
        .updateOne(
          { lessonID: lesson.lessonID },
          { $set: { spaces: lesson.spaces } }
        )
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      message: "Order completed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
