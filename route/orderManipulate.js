const router = require("express").Router();
const order = require("../models/order");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Notification = require("../models/Notifications");
const CryptoJS = require("crypto-js");
const verify = require("../verifyToken");
const services = require("../models/services1");
var messagebird = require("messagebird")("3IrLVHKY91Tg1CX24m1knZeRr");
const { Expo } = require("expo-server-sdk");
let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

// Fetch the Order which is register in last years

router.get("/stats", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);
  try {
    const data = await order.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
          // month: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

//post order in the DB

router.post("/newOrder", async (req, res) => {
  const newOrder = new order({
    customer_id: req.body.customer_id,
    admin_id: req.body.admin_id,
    order_type: req.body.order_type,
    order_status: req.body.order_status,
    order_price: req.body.order_price,
    order_address: req.body.order_address,
    order_pickDate: req.body.order_pickDate,
    order_pickTime: req.body.order_pickTime,
    orderRelate: req.body.customer_id,
  });
  try {
    const orders = await newOrder.save();

    //code to send message to the selected dhobie
    // write code that send push notification to the selected user who placed order
    // write code to send push notification to the selected dhobie

    // let dhobie_admin;
    // if (orders) {
    //   dhobie_admin = awUser.findById(orders.admin_id);

    //   var phone_number = dhobie_admin.mobile_no;
    //   var params = {
    //     originator: "TestMessage",
    //     recipients: phone_number,
    //     body: "Dear admin, You have a new order placed, check your inbox. Regard E-dhobiGaat",
    //   };

    //   messagebird.messages.create(params, function (err, response) {
    //     if (err) {
    //       return console.log(err);
    //     }
    //     console.log(response);
    //   });
    // }

    //  Code to send Push notification to the selected DhobiAdmin

    const token = await Admin.findById(req.body.admin_id);
    // console.log(token.userDeviceToken);
    const adminDhobi_id = req.body.admin_id;
    let dataToken;
    let messages = [];
    let pushToken = token.dhobiAdmDeviceToken;

    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
    }
    messages.push({
      to: pushToken,
      sound: "default",
      title: "Dear " + token.username,
      body: "You have new order Notification, please check inbox!",
      data: { badge: 1 },
    });

    const message = "You have new order Notification, please check inbox!";
    const notifications = new Notification({
      adminDhobi_id,
      message,
    });

    await notifications.save();

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    let receiptIds = [];

    (async () => {
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    })();

    for (let ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    (async () => {
      for (let chunk of receiptIdChunks) {
        try {
          let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
          console.log(receipts);
          for (let receiptId in receipts) {
            let { status, message, details } = receipts[receiptId];
            if (status === "ok") {
              continue;
            } else if (status === "error") {
              console.error(
                `There was an error sending a notification: ${message}`
              );
              if (details && details.error) {
                console.error(`The error code is ${details.error}`);
              }
            }
          }
          // res.status(200).json("Notifications has been pushed");
        } catch (error) {
          // console.error("Not valid  push notification", error);
          res.status(500).json(err);
        }
      }

      // res.status(200).json({ message: "Notification pushed" });
    })();

    res.status(200).json({ Result: "order placed successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET total earning about specfic admin_dhobie

router.get("/totalEarning/:id", async (req, res) => {
  try {
    const totalIncome = await order.aggregate([
      {
        $match: {
          $and: [{ admin_id: req.params.id }, { order_status: "delivered" }],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$order_price",
          },
        },
      },
    ]);

    res.status(200).json(totalIncome);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET total earning about all admin_dhobie
// Get all order price and add it that has completed status

router.get("/totalIncome", async (req, res) => {
  try {
    const totalIncome = await order.aggregate([
      {
        $match: {
          order_status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$order_price",
          },
        },
      },
    ]);

    res.status(200).json(totalIncome);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all order price and add it that has delivered status for specfic dhobie

router.get("/totalIncome/:id", async (req, res) => {
  try {
    const totalIncome = await order.aggregate({ admin_id: req.params.id }, [
      {
        $match: {
          order_status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$order_price",
          },
        },
      },
    ]);

    res.status(200).json(totalIncome);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET total no of order about specfic user/dhobi

router.get("/noOfOrder/:id", async (req, res) => {
  try {
    const orders = await order
      .find({
        $or: [{ customer_id: req.params.id }, { admin_id: req.params.id }],
      })
      .count();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});
//GET total no of processing order about specfic user/dhobi

router.get("/processingOrder/:id", async (req, res) => {
  try {
    const orders = await order
      .find({
        $or: [
          { customer_id: req.params.id, order_status: "processing" },
          { admin_id: req.params.id, order_status: "processing" },
        ],
      })
      .count();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET total no of cancelled order about specfic user/dhobi

router.get("/cancelledOrder/:id", async (req, res) => {
  try {
    const orders = await order
      .find({
        $or: [
          { customer_id: req.params.id, order_status: "cancelled" },
          { admin_id: req.params.id, order_status: "cancelled" },
        ],
      })
      .count();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all order about a specfic admin-dhobie

router.get("/findDhobies/:id", async (req, res) => {
  try {
    const orders = await order.find({ admin_id: req.params.id });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all order about a specfic admin-dhobie

router.get("/find/:id", async (req, res) => {
  try {
    const orders = await order.find({ customer_id: req.params.id });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all processing and pending order about a specfic admin-dhobie
// we will show these things on service with each dhobie service profile

router.get("/findOrders/:id", async (req, res) => {
  try {
    const orders = await order
      .find({ admin_id: req.params.id, order_status: "processing" })
      .count();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET total number of order

router.get("/totalOrder", async (req, res) => {
  try {
    const orders = await order.count();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET total order for orderlist

router.get("/totalOrderList/:id", async (req, res) => {
  try {
    const orders = await order
      .find({
        $or: [{ customer_id: req.params.id }, { admin_id: req.params.id }],
      })
      .populate("orderRelate");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET total order dhobie for orderlist

router.get("/totalOrderListDhobi/:id", async (req, res) => {
  try {
    const orders = await order
      .find({
        admin_id: req.params.id,
        order_status: "PROCESSING",
      })
      .populate("orderRelate");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// You do change this api accordingly...

// GET total pending orders

router.get("/totalPendingOrders/:id", async (req, res) => {
  try {
    const userdata = await order
      .find({ admin_id: req.params.id, order_status: "PENDING" })
      .populate("orderRelate");
    console.log(userdata);
    res.status(200).json(userdata);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET total order for dhobiList orderlist

router.get("/totalOrderesList/:id", async (req, res) => {
  try {
    const userdata = await order
      .find({ admin_id: req.params.id })
      .populate("orderRelate");
    console.log(userdata);
    res.status(200).json(userdata);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all pending order

router.get("/pendingOrder", async (req, res) => {
  try {
    const orders = await order.find({ order_status: "processing" }).count();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all completed order

router.get("/completedOrder", async (req, res) => {
  try {
    const orders = await order.find({ order_status: "delivered" }).count();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all cancelled order

router.get("/cancelledOrder", async (req, res) => {
  try {
    const orders = await order.find({ order_status: "cancelled" }).count();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get or Render order on dhobie admin-panel
// if it's not working properly then use this one
// find({ admin_id: req.params.id, order_status: "processing" })

router.get("/recentOrder/:id", async (req, res) => {
  try {
    const orders = await order.find(
      { admin_id: req.params.id } && { order_status: "processing" }
    );
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update the order_status of the order table
// Get data from two table..
router.put("/update/:id", async (req, res) => {
  try {
    const updatedOrder = await order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    // send push notification to the seleted user that your order has been accepted.

    const data = await order.findById(req.params.id);
    const user_id = data.customer_id;
    const userData = await User.findById(data.customer_id);
    console.log(userData.userDeviceToken);
    let dataToken;
    let messages = [];
    let pushToken = userData.userDeviceToken;
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
    }
    if (req.body.order_status === "PROCESSING") {
      //store data in notification table
      messages.push({
        to: pushToken,
        sound: "default",
        title: "Dear " + userData.username,
        body: "Your order has been accepted, So meets at your doorstep",
        data: { withSome: "data" },
      });
      const message = "Your order has been accepted, So meets at your doorstep";
      const notifications = new Notification({
        user_id,
        message,
      });

      await notifications.save();
    } else {
      messages.push({
        to: pushToken,
        sound: "default",
        title: "Dear " + userData.username,
        body: "Your order has been rejected",
        data: { withSome: "data" },
      });

      const message =
        "Your order has been rejected, So place order to somone else";
      const notifications = new Notification({
        user_id,
        message,
      });
      await notifications.save();
    }

    // save notification in table

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    let receiptIds = [];

    (async () => {
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    })();

    for (let ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    (async () => {
      for (let chunk of receiptIdChunks) {
        try {
          let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
          console.log(receipts);
          for (let receiptId in receipts) {
            let { status, message, details } = receipts[receiptId];
            if (status === "ok") {
              continue;
            } else if (status === "error") {
              console.error(
                `There was an error sending a notification: ${message}`
              );
              if (details && details.error) {
                console.error(`The error code is ${details.error}`);
              }
            }
          }
        } catch (error) {
          res.status(500).json(err);
        }
      }
    })();

    // send message to the seleted user

    // let phone_number = await admin.find({ admin_id: updatedOrder.admin_id });
    // // console.log(phone_number[0].mobile_no);
    // phone_number = phone_number[0].mobile_no;
    // var params = {
    //   originator: "TestMessage",
    //   recipients: phone_number,
    //   body: "Your order has been accepted. We will pick your clothes within 40 minutes. Regard: E-DhobiGaat",
    // };

    // messagebird.messages.create(params, function (err, response) {
    //   if (err) {
    //     return console.log(err);
    //   }
    //   console.log(response);
    // });

    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// send message to the phone number

router.get("/send", async (req, res) => {
  try {
    var phone_number = "+923029463719";
    var params = {
      originator: "TestMessage",
      recipients: phone_number,
      // recipients: ["+923161921936"],
      body: "Your order has been accepted. We will pick your clothes within 40 minutes. Regard: E-DhobiGaat",
    };

    messagebird.messages.create(params, function (err, response) {
      if (err) {
        return console.log(err);
      }
      console.log(response);
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
