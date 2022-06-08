const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile_no: { type: Number, required: true },
    profilePic: { type: String, data: Buffer, defaut: "" },
    owner: { type: Boolean, defaut: false },
    userDeviceToken: { type: String, defaut: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
