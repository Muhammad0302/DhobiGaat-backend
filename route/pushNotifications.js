const router = require("express").Router();
const User = require("../models/User");
const { Expo } = require("expo-server-sdk");
let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
const Notification = require("../models/Notifications");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// Get all notifications from database

router.get("/allNotifications/:id", async (req, res) => {
  try {
    const Notificationes = await Notification.find({
      $or: [{ user_id: req.params.id }, { adminDhobi_id: req.params.id }],
    });
    res.status(200).json(Notificationes);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Send push notification to specfic device

router.post("/pushNotifications", async (req, res) => {
  const token = await User.findById("6182c88cfbc7fa6a18da5f0d");
  // console.log(token.userDeviceToken);
  let dataToken;
  let messages = [];
  let pushToken = token.userDeviceToken;
  // let pushToken = "ExponentPushToken[iWKKd7O_mUNDPn1RRm5Gq8]";
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
  }
  messages.push({
    to: pushToken,
    sound: "default",
    title: "Dear Ismail",
    body: "Check your inbox for order",
    data: { withSome: "data" },
  });

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

    res.status(200).json({ message: "Notification pushed" });
  })();
});

module.exports = router;
