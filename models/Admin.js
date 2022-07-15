const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    mobile_no: { type: String },
    password: { type: String, required: true },
    isService: { type: Boolean, default: false },
    profilePic: { type: String, default: "" },
    frequency_order: { type: String },
    dhobiAdmDeviceToken: { type: String, default: "" },
    status: { type: Boolean, default: false },
    cityName: { type: String, default: "" },
    coordinate: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
