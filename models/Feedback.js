const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user_id: { type: String },
    admin_id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    user_type: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
