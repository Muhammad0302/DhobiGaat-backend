const router = require("express").Router();
var fs = require("fs");
const adminUser = require("../models/Admin");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const verifyToken = require("../verifyToken");
var nodemailer = require("nodemailer");
var messagebird = require("messagebird")("8Rko0KgjA6dXAX0z9wYvqW3RV");

let username, email, password, profilePic, randomNumber, address, mobile_no;
let randomNumber1;

//Render dhobies for map
router.get("/dhobieForMap", async (req, res) => {
  try {
    // We will use select to return specfic attribute from a query
    // We need to add a condition that has isService true return only those adminesDhobies
    const listOfDhobies = await adminUser
      .find({isService:true})
      .select("address cityName latitude longitude username coordinate");
    // console.log(listOfDhobies);
    res.status(200).json(listOfDhobies);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/ApproveDhobie/:id", async (req, res) => {
  const updatedUser = await adminUser.findById(req.params.id);
  email = updatedUser.email;

  if (req.body.status == true) {
    try {
      const updatedUser = await adminUser.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status,
        },
        { new: true }
      );

      // Now send email to that user whose account approved

      var transporter = nodemailer.createTransport({
        port: 587,
        service: "gmail",
        auth: {
          user: "mi477048@gmail.com",
          pass: "szdahysparzzxfuy",
        },
      });

      var mailOptions = {
        from: "E-dhobieGaat",
        to: email,
        subject: "Account verification",
        html: `
    <p>Dear Mr ${updatedUser.username}, Your account has been approved. You can login and provide Laundry services on our app now. </p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.status(200).json({
        message: "Account hass been approved",
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      await adminUser.findByIdAndDelete(req.params.id);

      // Now send email to that user whose account approved

      var transporter = nodemailer.createTransport({
        port: 587,
        service: "gmail",
        auth: {
          user: "mi477048@gmail.com",
          pass: "szdahysparzzxfuy",
        },
      });

      var mailOptions = {
        from: "E-dhobieGaat",
        to: email,
        subject: "Account verification",
        html: `
    <p>Dear Mr ${updatedUser.username}, Due to some reason your account has been rejected. Kindly get back with us on email </p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.status(200).json({ result: "Dhobie account has been deleted..." });
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

//Get all dhobie customer who have status false

router.get("/fetchAllRecentDhobies", async (req, res) => {
  try {
    const user = await adminUser.find({ status: false });
    // const { password, ...info } = user._doc;
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete multiple DhobieAdmin

router.post("/delMulAdminDhobie", async (req, res) => {
  const arrayUsers = req.body.arrayUser;
  try {
    const users = await adminUser.remove({ _id: { $in: arrayUsers } });

    res.status(200).json("Dhobies has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//send Email

router.post("/sendEmail", async (req, res) => {
  email = req.body.email;
  const userExist = await adminUser.findOne({ email: req.body.email });
  const IsSameUsername = await adminUser.findOne({
    username: req.body.username,
  });
  if (userExist) {
    return res
      .status(403)
      .json({ Result: "Customer already exist in this email" });
  }
  if (IsSameUsername) {
    return res
      .status(403)
      .json({ Result: "User_Dhobi already exist in this username" });
  }

  //generate a random number Id

  randomNumber1 = Math.floor(100000 + Math.random() * 900000);
  randomNumber1 = String(randomNumber1);
  randomNumber1 = randomNumber1.substring(0, 4);

  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mi477048@gmail.com",
        pass: "szdahysparzzxfuy",
      },
    });

    var mailOptions = {
      from: "E-dhobieGaat",
      to: req.body.email,
      subject: "Verify your email",
      html: `
    <p>Your verification code is <a href="#">${randomNumber1}</a> </p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        var myOptions = {
          randomNumber1,
        };

        var data = JSON.stringify(myOptions);

        fs.writeFile("./config/config.json", data, function (err) {
          if (err) {
            console.log(
              "There has been an error saving your configuration data."
            );
            console.log(err.message);
            return;
          }
          console.log("Configuration saved successfully.");
        });
      }
    });
    //  Save the random number value in config file

    res.status(200).json({
      message: "Enter the verification code that send to your email",
    });
  } catch (error) {
    console.log(error);
  }
});

//login through verify email

router.post("/register/secure", async (req, res) => {
  // Read the randomNumber value from config file

  var data = fs.readFileSync("./config/config.json"),
    myObj;
  myObj = JSON.parse(data);

  if (parseInt(myObj.randomNumber1) !== req.body.randomNumber) {
    return res.send({ message: "You enter invalid verification code" });
  }
  const newUser = new adminUser({
    username: req.body.username,
    email: req.body.email,
    address: req.body.address,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
    frequency_order: req.body.frequency_order,
    profilePic: req.body.profilePic,
    address: req.body.address,
    isService: req.body.isService,
    mobile_no: req.body.mobile_no,
    cityName: req.body.cityName,
    coordinate: req.body.coordinate,
  });
  try {
    const user = await newUser.save();
    // res.status(200).json({ Result: "Customer register successfully" });
    res.status(200).json({
      Result: "You will get email, Once the admin look and appove your account",
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//REGISTER a admin_dhobie

router.post("/registerSecure", async (req, res) => {
  username = req.body.username;
  email = req.body.email;
  password = req.body.password;
  owner = req.body.owner;
  profilePic = req.body.profilePic;
  address = req.body.address;
  isService = req.body.isService;
  mobile_no = req.body.mobile_no;
  cityName = req.body.cityName;
  coordinate: req.body.coordinate;
  const userExist = await adminUser.findOne({ email: req.body.email });
  if (userExist) {
    console.log(userExist);
    return res.status(403).json("Admin_dhobie already exist in this email");
  }

  //generate a random number Id

  randomNumber = Math.floor(100000 + Math.random() * 900000);
  randomNumber = String(randomNumber);
  randomNumber = randomNumber.substring(0, 7);
  const userId = randomNumber;
  try {
    const secret = process.env.SECRET_KEY + req.body.password;
    const payload = {
      email: req.body.email,
      id: userId,
    };

    // set expiration time for the link

    const token = jwt.sign(payload, secret, { expiresIn: "15m" });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mi477048@gmail.com",
        pass: "szdahysparzzxfuy",
      },
    });

    var mailOptions = {
      from: "E-dhobieGaat",
      to: req.body.email,
      subject: "Verify your email",
      html: `
    <h3>Verify your email through the following link </h3>
    <p><a href="http://localhost:3000/reset/${userId}/${token}">Email verification</a> </p>
    `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({ message: "Verify your email" });
  } catch (error) {
    console.log(error);
  }
});

// Now email has been verify save the user

router.post("/new__password/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;

  if (id !== randomNumber) {
    return res.send("Invalid Id... ");
  }

  const secret = process.env.SECRET_KEY + password;
  try {
    const payload = jwt.verify(token, secret);
    if (!payload) {
      return res.status(402).json("Your token is expire");
    }
    const newUser = new adminUser({
      username,
      email,
      address,
      mobile_no,
      profilePic: req.body.profilePic,
      password: CryptoJS.AES.encrypt(
        password,
        process.env.SECRET_KEY
      ).toString(),
      cityName: req.body.cityName,
      coordinate: req.body.coordinate,
    });

    const user = await newUser.save();
    res
      .status(200)
      .json(
        "Your account has been successfully created go and login now on your account"
      );
    console.log(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

//REGISTER DHOBIE

router.post("/register", async (req, res) => {
  const newDhobie = new adminUser({
    username: req.body.username,
    email: req.body.email,
    address: req.body.address,
    mobile_no: req.body.mobile_no,
    profilePic: req.body.profilePic,
    frequency_order: req.body.frequency_order,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
    owner: req.body.owner,
    cityName: req.body.cityName,
    coordinate: req.body.coordinate,
  });

  const dhobieExist = await adminUser.findOne({ email: req.body.email });

  if (dhobieExist) {
    console.log(dhobieExist);
    return res.status(201).json({ Result: "User already exist in this email" });
  }

  try {
    const dhobieAdmin = await newDhobie.save();
    res.status(200).json({ Result: "Account created successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await adminUser.findOne({ email: req.body.email });
    !user && res.status(401).json("Wrong password or username!");

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    originalPassword !== req.body.password &&
      res.status(401).json("Wrong password or username!");

    if (user.status == false) {
      return res
        .status(203)
        .json({ Result: "Your account have not approved!" });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "90d",
    });
    var addMessage = { Result: "Login success" };
    const { password, ...info } = user._doc;

    res.status(200).json({ ...info, ...addMessage, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE admin account
// If the middleware not working somewhere just remove it, it will be perfactly working without verifytoken
router.delete("/delete/:id", async (req, res) => {
  try {
    await adminUser.findByIdAndDelete(req.params.id);
    res.status(200).json("Admin account has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update admin account

router.put("/update/:id", async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString();
  }

  try {
    const updatedUser = await adminUser.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json("Dhobie has been updated");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET customer or admin-dhobie information
// If the middleware not working somewhere just remove it, it will be perfactly working without verifytoken

router.get("/find/:id", verifyToken, async (req, res) => {
  try {
    const user = await adminUser.findById(req.params.id);
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all admin-dhobie or customer information

router.get("/find/", async (req, res) => {
  try {
    const admines = await adminUser.find();
    res.status(200).json(admines);
  } catch (err) {
    res.status(500).json(err);
  }
});

//  update freequency of admin
router.put("/updateFrequencyOrder/:id", async (req, res) => {
  try {
    const updatedUser = await adminUser.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json({ Result: "frequency updated" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET total number of admin Dobies

router.get("/getTotalDhobies", async (req, res) => {
  try {
    const adminDobies = await adminUser.count();
    res.status(200).json(adminDobies);
  } catch (err) {
    res.status(500).json(err);
  }
});

// add device token for adminDhobie

router.put("/deviceToken/:id", async (req, res) => {
  try {
    const updatedUser = await adminUser.findByIdAndUpdate(
      req.params.id,
      {
        dhobiAdmDeviceToken: req.body.deviceToken,
      },
      { new: true }
    );
    res.status(200).json({ result: "device token added" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
