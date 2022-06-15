const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// Fetch the user which is register in last years

router.get("/stats", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);
  try {
    const data = await User.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
          // month: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET a specfic user record

router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json(err);
  }
});
// Push token in user specfic record

router.put("/tokenPost/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      userDeviceToken: req.body.token,
    });
    res.status(200).json({ message: "Token saved successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
