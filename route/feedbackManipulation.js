const router = require("express").Router();
const Feedback = require("../models/Feedback");
const verifyToken = require("../verifyToken");
//post feedback in the DB

router.post("/post", async (req, res) => {
  const feedbackes = new Feedback({
    user_id: req.body.user_id,
    admin_id: req.body.admin_id,
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    user_type: req.body.user_type,
  });
  try {
    const orders = await feedbackes.save();
    res.status(200).json({ Result: "Your query placed successfully" });
    // res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all the feedback on the screen

router.get("/get", async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
