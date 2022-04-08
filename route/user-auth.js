const router = require("express").Router();
var fs = require("fs");
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const verifyToken = require("../verifyToken");
var nodemailer = require("nodemailer");
var messagebird = require("messagebird")("8Rko0KgjA6dXAX0z9wYvqW3RV");

// GET total number of users

router.get("/totalUser", async (req, res) => {
  try {
    const users = await User.count();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Two factor authentication of the user

router.post("/postNumber", (req, res) => {
  var number = req.body.number;
  messagebird.verify.create(
    number,
    {
      template: "Your verification code is %token",
    },
    function (err, response) {
      if (err) {
        console.log(err);
        res.status(500).json(err.errors[0].description);
      } else {
        console.log(response);
        res.status(200).json(response.id);
      }
    }
  );
});

router.post("/getAuth", (req, res) => {
  var id = req.body.id;
  var token = req.body.token;

  messagebird.verify.verify(id, token, (err, response) => {
    if (err) {
      res.status(500).json(err.errors[0].description, id);
    } else {
      res.status(200).json(response);
    }
  });
});

let username, email, password, profilePic, randomNumber, address, mobile_no;

//REGISTER a user

router.post("/registerSecure", async (req, res) => {
  username = req.body.username;
  email = req.body.email;
  password = req.body.password;
  owner = req.body.owner;
  mobile_no = req.body.mobile_no;
  profilePic = req.body.profilePic;

  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    console.log(userExist);
    return res.status(403).json("User already exist in this email");
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
        pass: "samarbagh12345",
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
  // const newUser = new User({
  //   username: req.body.username,
  //   email: req.body.email,
  //   profilePic: req.body.profilePic,
  //   password: CryptoJS.AES.encrypt(
  //     req.body.password,
  //     process.env.SECRET_KEY
  //   ).toString(),
  //   owner: req.body.owner,
  // });
  // try {
  //   const user = await newUser.save();
  //   res.status(201).json(user);
  // } catch (err) {
  //   res.status(500).json(err);
  // }
});

let randomNumber1 = 918468;

// //send Email

// router.post("/sendEmail", async (req, res) => {
//   email = req.body.email;
//   const userExist = await User.findOne({ email: req.body.email });
//   if (userExist) {
//     console.log(userExist);
//     return res.status(403).json("User already exist in this email");
//   }
//   //generate a random number Id

//   randomNumber1 = Math.floor(100000 + Math.random() * 900000);
//   randomNumber1 = String(randomNumber1);
//   randomNumber1 = randomNumber1.substring(0, 7);

//   try {
//     const newUser = new User({
//       randomNumber: randomNumber1,
//     });
//     const user = await newUser.save();
//     var transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "mi477048@gmail.com",
//         pass: "samarbagh12345",
//       },
//     });

//     var mailOptions = {
//       from: "E-dhobieGaat",
//       to: req.body.email,
//       subject: "Verify your email",
//       html: `
//     <p>Your verification code is <a href="#">${randomNumber1}</a> </p>`,
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log("Email sent: " + info.response);
//       }
//     });

//     res.status(200).json({
//       message: "Enter the verification code that send to your email",
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

// //login through verify email

// router.post("/register/secure", async (req, res) => {
//   try {
//     const randomNumber = await User.find({
//       randomNumber: req.body.randomNumber,
//     });

//     console.log("req.body:", req.body.randomNumber);
//     console.log("randomNumber:", randomNumber);

//     // if (randomNumber1 !== req.body.randomNumb) {
//     //   return res.send({ message: "You enter invalid verification code" });
//     // }
//     // const newUser = new User({
//     //   username: req.body.username,
//     //   email: req.body.email,
//     //   mobile_no: req.body.mobile_no,
//     //   profilePic: req.body.profilePic,
//     //   password: CryptoJS.AES.encrypt(
//     //     req.body.password,
//     //     process.env.SECRET_KEY
//     //   ).toString(),
//     //   owner: req.body.owner,
//     // });

//     // const user = await newUser.save();
//     // var addMessage1 = { Result: "Registration success" };
//     // res.status(200).json({ Result: "user register successfully" });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//send Email

router.post("/sendEmail", async (req, res) => {
  email = req.body.email;
  const userExist = await User.findOne({ email: req.body.email });
  const IsSameUsername = await User.findOne({
    username: req.body.username,
  });
  if (userExist) {
    return res.status(403).json({ Result: "User already exist in this email" });
  }
  if (IsSameUsername) {
    return res
      .status(403)
      .json({ Result: "User already exist in this username" });
  }

  //generate a random number Id

  randomNumber1 = Math.floor(100000 + Math.random() * 900000);
  randomNumber1 = String(randomNumber1);
  randomNumber1 = randomNumber1.substring(0, 4);

  try {
    var transporter = nodemailer.createTransport({
      port: 587,
      service: "gmail",
      auth: {
        user: "mi477048@gmail.com",
        pass: "samarbagh12345",
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

//Register through verify email

router.post("/register/secure", async (req, res) => {
  // Read the randomNumber value from config file

  var data = fs.readFileSync("./config/config.json"),
    myObj;
  myObj = JSON.parse(data);

  // console.dir(parseInt(myObj.randomNumber1));
  // console.log("req.body:", req.body.randomNumber);
  // console.log("randomNumber:", parseInt(myObj.randomNumber1));

  if (parseInt(myObj.randomNumber1) !== req.body.randomNumber) {
    return res.send({ message: "You enter invalid verification code" });
  }
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
  try {
    const user = await newUser.save();
    var addMessage1 = { Result: "Registration success" };
    res.status(200).json({ Result: "user register successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Now email has been verify save the user

router.post("/new__password/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;

  console.log("id:", id);
  console.log("randomNumber:", randomNumber);
  console.log("password:", password);
  console.log("username:", username);
  console.log("token:", token);

  // if (id !== randomNumber) {
  //   return res.send("Invalid Id... ");
  // }

  const secret = process.env.SECRET_KEY + password;
  try {
    const payload = jwt.verify(token, secret);
    if (!payload) {
      return res.status(402).json("Your token is expire");
    }
    const newUser = new User({
      username,
      email,
      mobile_no,
      profilePic: req.body.profilePic,
      password: CryptoJS.AES.encrypt(
        password,
        process.env.SECRET_KEY
      ).toString(),
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

//REGISTER

router.post("/register", async (req, res) => {
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
    var addMessage2 = { Result: "User exist" };
    console.log(userExist);
    return res.status(201).json({ Result: "User already exist in this email" });
  }
  try {
    const user = await newUser.save();
    var addMessage1 = { Result: "Registration success" };
    res.status(200).json({ Result: "user register successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(401).json("Wrong password or username!");

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    originalPassword !== req.body.password &&
      res.status(401).json("Wrong password or username!");

    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "90d",
    });

    const { password, ...info } = user._doc;

    var addMessage = { Result: "Login success" };
    res.status(200).json({ ...info, ...addMessage, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

//Owner admin hard coded login

router.post("/login/owner", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    if (email == "ismail@gmail.com" && password == "pakistan12345") {
      const user = await User.findOne({ email: req.body.email });
      const { password, ...info } = user._doc;
      var addMessage = { Result: "Login successfully" };
      res.status(200).json({ ...info, ...addMessage });
    } else {
      res.status(203).json({ Result: "Email or password invalid" });
    }
  } catch (err) {
    res.status(500).json(error);
  }
});

// DELETE user account

router.delete("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User account has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update admin account

router.put("/update/:id", verifyToken, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString();
  }

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

//GET a user information
// If the middleware not working somewhere just remove it, it will be perfactly working without verifytoken

router.get("/find/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all user information information

router.get("/find/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Add profile information to the user table

router.put("/find/:id", async (req, res) => {
  try {
    const users = await User.findByIdAndUpdate(req.params._id);
    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
