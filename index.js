const express = require("express");
const fileUpload = require("express-fileupload");
const hostName = "0.0.0.0";
const app = express();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const serviceAccount = require("./firebase.json");
const dotenv = require("dotenv");
const userAuthRoute = require("./route/user-auth");
const adminAuthRoute = require("./route/admin-auth");
const adminManipulate = require("./route/adminManipulate");
const orderManipulate = require("./route/orderManipulate");
const userManipulate = require("./route/userManipulate");
const serviceManipulate = require("./route/serviceManipulate");
const resetEmail = require("./route/resetEmail");
const feedback = require("./route/feedbackManipulation");
const imageUpload = require("./route/imageUpload");
const Notifications = require("./route/pushNotifications");
var cors = require("cors");
const admin = require("firebase-admin");
const port = process.env.PORT || 8800;
dotenv.config();
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection Successfull"))
  .catch((err) => {
    console.error(err);
  });

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static("./public"));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/userAuth", userAuthRoute);
app.use("/api/adminAuth", adminAuthRoute);
app.use("/api/adminManipulate", adminManipulate);
app.use("/api/orderManipulate", orderManipulate);
app.use("/api/userManipulate", userManipulate);
app.use("/api/serviceManipulate", serviceManipulate);
app.use("/api/resetEmail", resetEmail);
app.use("/api/feedback", feedback);
app.use("/api/imageUpload", imageUpload);
app.use("/api/notifications", Notifications);

app.listen(port, hostName, () => {
  console.log("Backend server is running!");
});
