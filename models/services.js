const mongoose = require("mongoose");

const servicesSchema = new mongoose.Schema(
  {
    admin_id: { type: String, required: true, unique: true },
    frequency_order: { type: Number, required: true },
    service1: [
      {
        image: {
          type: String,
          default: "",
        },
        title: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        normal_price: {
          type: Number,
          default: "Number",
        },
        urgent_price: {
          type: Number,
          default: "Number",
        },
      },
    ],
    service2: [
      {
        image: {
          type: String,
          default: "",
        },
        title: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        normal_price: {
          type: Number,
          default: "Number",
        },
        urgent_price: {
          type: Number,
          default: "Number",
        },
      },
    ],
    service3: [
      {
        image: {
          type: String,
          default: "",
        },
        title: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        normal_price: {
          type: Number,
          default: "Number",
        },
        urgent_price: {
          type: Number,
          default: "Number",
        },
      },
    ],

    service4: [
      {
        image: {
          type: String,
          default: "",
        },
        title: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        normal_price: {
          type: Number,
          default: "Number",
        },
        urgent_price: {
          type: Number,
          default: "Number",
        },
      },
    ],
    service5: [
      {
        image: {
          type: String,
          default: "",
        },
        title: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        normal_price: {
          type: Number,
          default: "Number",
        },
        urgent_price: {
          type: Number,
          default: "Number",
        },
      },
    ],

    // service2: { type: Array, defaut: [] },
    // service3: { type: Array, defaut: [] },
    // service4: { type: Array, defaut: [] },
    // service5: { type: Array, defaut: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("service", servicesSchema);
