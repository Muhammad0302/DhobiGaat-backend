const mongoose = require("mongoose");

const NotificationsSchema = new mongoose.Schema(
  {
    user_id: { type: String },
    adminDhobi_id: { type: String },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", NotificationsSchema);
