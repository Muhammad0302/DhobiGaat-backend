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

//socila login

router.post("/socialLogin", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    mobile_no: req.body.mobile_no,
    profilePic: req.body.profilePic,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
    owner: req.body.owner,
  });

  const userExist = await User.findOne({ email: req.body.email });

  if (userExist) {
    console.log(userExist);
    return res.status(201).json({ Result: "Your are login successfully" });
  }
  try {
    const user = await newUser.save();
    res.status(200).json({ Result: "user register successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// add number to socialLogin

// Add attribute mobile_no

router.put("/updateSocialLogin/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
