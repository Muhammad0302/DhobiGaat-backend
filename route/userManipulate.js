const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

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
