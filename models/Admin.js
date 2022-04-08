const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    mobile_no: { type: String, required: true },
    password: { type: String, required: true },
    isService: { type: Boolean, default: false },
    profilePic: { type: String, defaut: "" },
    frequency_order: { type: String },
    dhobiAdmDeviceToken: { type: String, defaut: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
