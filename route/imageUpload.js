const router = require("express").Router();
const User = require("../models/User");
const AdminDhobie = require("../models/Admin");
const path = require("path");
const util = require("util");
const fs = require("fs");
const mime = require("mime");

// upload img url into AdminDhobi table
router.put("/admin/uploadPhoto/:id", async (req, res) => {
  try {
    const userProfile = await AdminDhobie.updateOne(
      { _id: req.params.id },
      {
        $set: { profilePic: req.body.profileImage },
      }
    );
    res.status(200).json({ result: "Profile Uploaded successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get photo url of a adminDhobie
router.get("/admin/photo/:id", async (req, res) => {
  try {
    const userProfile = await AdminDhobie.findById(req.params.id);
    res.status(200).json(userProfile);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// upload img url into user table
router.put("/uploadPhoto/:id", async (req, res) => {
  try {
    const userProfile = await User.updateOne(
      { _id: req.params.id },
      {
        $set: { profilePic: req.body.profileImage },
      }
    );
    res.status(200).json({ result: "Profile Uploaded successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get photo url of a user
router.get("/photo/:id", async (req, res) => {
  try {
    const userProfile = await User.findById(req.params.id);
    res.status(200).json(userProfile);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// image uploading with base64 string
router.put("/postUser/:id", async (req, res) => {
  // to declare some path to store your converted image
  var matches = req.body.base64image.match(
      /^data:([A-Za-z-+\/]+);base64,(.+)$/
    ),
    response = {};

  if (matches.length !== 3) {
    return new Error("Invalid input string");
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], "base64");
  let decodedImg = response;
  let imageBuffer = decodedImg.data;
  let type = decodedImg.type;
  let extension = mime.getExtension(type);
  let fileName = Date.now() + "." + extension;

  try {
    const user = await User.findById(req.params.id);
    // console.log(user.profilePic);
    if (user.profilePic) {
      // delete the picture from uploads folder
      fs.unlink("public/uploads/" + user.profilePic, (err) => {
        if (err) {
          console.log("Error while deleting existance picture");
          // res.status(205).json("Error while deleting existance picture");
        } else {
          console.log("Existance picture deleted");
        }
      });
    }

    fs.writeFileSync("./public/uploads/" + fileName, imageBuffer, "utf8");

    // await util.promisify(file.mv)("./public/uploads/" + URL);

    const userProfile = await User.updateOne(
      { _id: req.params.id },
      {
        $set: { profilePic: fileName },
      }
    );
    res
      .status(200)
      .json({ message: "Profile Uploaded successfully!", url: URL });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err,
    });
  }
});

// image uploading without base64 string

router.put("/postUserImage/:id", async (req, res) => {
  try {
    const file = req.files.file;
    const fileName = file.name;
    const size = file.data.length;
    const extension = path.extname(fileName);
    const allowedExtensions = /png|jpeg|jpg|gif/;
    if (!allowedExtensions.test(extension)) throw "Unsupported extensions!";
    if (size > 5000000) throw "File must be less than 5MB";
    const user = await User.findById(req.params.id);
    // console.log(user.profilePic);
    if (user.profilePic) {
      // delete the picture from uploads folder
      fs.unlink("public/uploads/" + user.profilePic, (err) => {
        if (err) {
          console.log("Error while deleting existance picture");
          // res.status(205).json("Error while deleting existance picture");
        } else {
          console.log("Existance picture deleted");
        }
      });
    }
    const md5 = file.md5;
    const URL = md5 + extension;
    await util.promisify(file.mv)("./public/uploads/" + URL);

    const userProfile = await User.updateOne(
      { _id: req.params.id },
      {
        $set: { profilePic: URL },
      }
    );
    res
      .status(200)
      .json({ message: "Profile Uploaded successfully!", url: URL });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err,
    });
  }
});

module.exports = router;
