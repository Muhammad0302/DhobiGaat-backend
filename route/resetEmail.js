const router = require("express").Router();
const User = require("../models/User");
const Admin_dhobie = require("../models/Admin");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
var fs = require("fs");
// Rest email for owner admin

router.post("/reset__password", async (req, res) => {
  const forgetEmail = req.body.email;
  try {
    const user = await User.findOne({ email: forgetEmail } && { owner: true });
    if (!user) {
      return res
        .status(500)
        .json({ error: "Admin Owner dont exists with that email" });
    }

    const secret = process.env.SECRET_KEY + user.password;
    const payload = {
      email: user.email,
      id: user.id,
    };

    // set expiration time for the link

    const token = jwt.sign(payload, secret, { expiresIn: "15m" });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mi477048@gmail.com",
        pass: "Samarbagh123456",
      },
    });

    var mailOptions = {
      from: "E-dhobieGaat",
      to: user.email,
      subject: "Password Reset",
      html: `
    <h3>You requested for password reset</h3>
    <p>Click in this <a href="http://localhost:3000/reset/${user.id}/${token}">link</a> to reset your password </p>
    `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({ message: "Check your email" });
  } catch (error) {
    console.log(error);
  }
});

// updated the password

router.post("/new__password/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;

  const user = await User.findById(id);

  if (id !== user.id) {
    res.send("Invalid Id... ");
  }

  const newPassword = CryptoJS.AES.encrypt(
    req.body.password,
    process.env.SECRET_KEY
  ).toString();

  const secret = process.env.SECRET_KEY + user.password;
  try {
    const payload = jwt.verify(token, secret);
    const passwordUpdated = await User.findByIdAndUpdate(payload.id, {
      $set: { password: newPassword },
    });
    res.status(200).json(passwordUpdated);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Rest email of user in mobile apps

router.post("/resetPass", async (req, res) => {
  email = req.body.email;
  const userExist = await User.findOne({ email: req.body.email });
  const dhobiUserExist = await Admin_dhobie.findOne({ email: req.body.email });

  if (!userExist && !dhobiUserExist) {
    return res.status(403).json({ Result: "User don't exist in this email" });
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
        pass: "Samarbagh123456",
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

//Now verify email for user in mobile

router.post("/verifyUser", async (req, res) => {
  // Read the randomNumber value from config file

  var data = fs.readFileSync("./config/config.json"),
    myObj;
  myObj = JSON.parse(data);

  if (parseInt(myObj.randomNumber1) !== req.body.randomNumber) {
    return res.send({ message: "You enter invalid verification code" });
  }
  try {
    res.status(200).json({ Result: "user verification successed" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Now update user or admin dhobi password
router.put("/newPassword", async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString();
  }
  try {
    const users = await User.findOneAndUpdate(
      { email: req.body.email },
      { password: req.body.password }
    );
    const dhobiUsers = await Admin_dhobie.findOneAndUpdate(
      { email: req.body.email },
      { password: req.body.password }
    );

    res.status(200).json({ result: "Your password changed successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Rest email of user in websites

router.post("/resetPassword", async (req, res) => {
  const forgetEmail = req.body.email;
  try {
    const user = await User.findOne({ email: forgetEmail });
    if (!user) {
      return res
        .status(500)
        .json({ error: "User dont exists with that email" });
    }

    const secret = process.env.SECRET_KEY + user.password;
    const payload = {
      email: user.email,
      id: user.id,
    };

    // set expiration time for the link

    const token = jwt.sign(payload, secret, { expiresIn: "15m" });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mi477048@gmail.com",
        pass: "Samarbagh123456",
      },
    });

    var mailOptions = {
      from: "E-dhobieGaat",
      to: user.email,
      subject: "Password Reset",
      html: `
    <h3>You requested for password reset</h3>
    <p>Click in this <a href="http://localhost:3000/reset/${user.id}/${token}">link</a> to reset your password </p>
    `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({ message: "Check your email" });
  } catch (error) {
    console.log(error);
  }
  //   var transporter = nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //       user: "mi477048@gmail.com",
  //       pass: "Samarbagh123456",
  //     },
  //   });

  //   var mailOptions = {
  //     from: "mi477048@gmail.com",
  //     to: "18mdswe013@uetmardan.edu.pk",
  //     subject: "Sending Email using Node.js",
  //     text: `Hi Smartherd, thank you for your nice Node.js tutorials.
  //           I will donate 50$ for this course. Please send me payment options.`,
  //     // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'
  //   };

  //   transporter.sendMail(mailOptions, function (error, info) {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log("Email sent: " + info.response);
  //     }
  //   });
});

// updated the password

router.post("/new-password/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;

  const user = await User.findById(id);

  if (id !== user.id) {
    res.send("Invalid Id... ");
  }

  const newPassword = CryptoJS.AES.encrypt(
    req.body.password,
    process.env.SECRET_KEY
  ).toString();

  const secret = process.env.SECRET_KEY + user.password;
  try {
    const payload = jwt.verify(token, secret);
    const passwordUpdated = await User.findByIdAndUpdate(payload.id, {
      $set: { password: newPassword },
    });

    // newPassword: CryptoJS.AES.encrypt(
    //     req.body.password,
    //     process.env.SECRET_KEY
    //   ).toString()

    res.status(200).json(passwordUpdated);
  } catch (error) {
    res.status(500).json(error);
  }
});

// router.post("/new-password", (req, res) => {
//     const newPassword = req.body.password;
//     const sentToken = req.body.Token;
//     User.findone({
//       resetToken: sentToken,
//       expireToken: { $gt: Date.now() },
//     })
//       .then((user) => {
//         if (!user) {
//           return res.status(500).json({ error: "Try again session expired" });
//         }
//         bcrypt.hash(newPassword, 12).then((hashedpassword) => {
//           user.password = hashedpassword;
//           user.resetToken = undefined;
//           user.expireToken = undefined;
//           user.save().then((saveduser) => {
//             res.json({ message: "password updated success" });
//           });
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });

// Rest email of admin-dhobie

router.post("/passwordReset", async (req, res) => {
  const forgetEmail = req.body.email;
  try {
    const user = await Admin_dhobie.findOne({ email: forgetEmail });
    if (!user) {
      return res
        .status(500)
        .json({ error: "User dont exists with that email" });
    }

    const secret = process.env.SECRET_KEY + user.password;
    const payload = {
      email: user.email,
      id: user.id,
    };

    // set expiration time for the link

    const token = jwt.sign(payload, secret, { expiresIn: "15m" });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mi477048@gmail.com",
        pass: "Samarbagh123456",
      },
    });

    var mailOptions = {
      from: "E-dhobieGaat",
      to: user.email,
      subject: "Password Reset",
      html: `
    <h3>You requested for password reset</h3>
    <p>Click in this <a href="http://localhost:3000/reset/${user.id}/${token}">link</a> to reset your password </p>
    `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({ message: "Check your email" });
  } catch (error) {
    console.log(error);
  }
});

// updated the password

router.post("/update_password/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;

  const user = await Admin_dhobie.findById(id);

  if (id !== user.id) {
    res.send("Invalid Id... ");
  }

  const newPassword = CryptoJS.AES.encrypt(
    req.body.password,
    process.env.SECRET_KEY
  ).toString();

  const secret = process.env.SECRET_KEY + user.password;
  try {
    const payload = jwt.verify(token, secret);
    const passwordUpdated = await Admin_dhobie.findByIdAndUpdate(payload.id, {
      $set: { password: newPassword },
    });

    res.status(200).json(passwordUpdated);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
