const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer_id: { type: String, required: true },
    admin_id: { type: String, required: true },
    order_type: { type: String, defaut: "normal" },
    order_status: { type: String, required: true },
    order_price: { type: Number, required: true },
    order_address: { type: String, required: true },
    order_pickDate: { type: String, required: true },
    order_pickTime: { type: String, required: true },
    orderRelate: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
