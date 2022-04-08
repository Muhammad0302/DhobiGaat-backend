const router = require("express").Router();
const Admin = require("../models/Admin");
const order = require("../models/order");
const CryptoJS = require("crypto-js");
const verify = require("../verifyToken");
const ObjectId = require("mongodb").ObjectId;
//GET ALL dhobies

router.get("/", async (req, res) => {
  try {
    const Admins = await Admin.find();
    res.status(200).json(Admins);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all dhobiAdmin who have isService= true

// router.get("/getAllAdmines/", async (req, res) => {
//   try {
//     const dhobiAdmines = await Admin.find({ isService: true });
//     res.status(200).json(dhobiAdmines);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//GET all dhobiAdmin who have isService= true

router.get("/letestOrder/", async (req, res) => {
  try {
    const latestOrders = await order.find({
      _id: {
        $gt: ObjectId.createFromTime(Date.now() / 1000 - 24 * 60 * 60),
      },
    });
    res.status(200).json(latestOrders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all dhobiAdmin who have isService= true
//  put frequency logic here
router.get("/getAllAdmines/", async (req, res) => {
  try {
    const allAdmines = await Admin.find({ isService: true });
    let AdminesList = await Promise.all(
      allAdmines.map(async (element) => {
        // console.log(element.id);
        var TotalOrders = await order
          .find({
            _id: {
              $gt: ObjectId.createFromTime(Date.now() / 1000 - 24 * 60 * 60),
            },
            admin_id: element.id,
            order_status: "PROCESSING",
          })
          .count();
        // console.log(TotalOrders);

        if (TotalOrders < parseInt(element.frequency_order)) {
          return element;
          // console.log(element);
        }
      })
    );
    const AdminesListes = AdminesList.filter((element) => element != null);
    res.status(200).json(AdminesListes);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Push token in DhobiAdmin specfic record

router.put("/tokenPost/:id", async (req, res) => {
  try {
    const user = await Admin.findByIdAndUpdate(req.params.id, {
      dhobiAdmDeviceToken: req.body.token,
    });
    res.status(200).json({ message: "Token saved successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});



module.exports = router;

// //UPDATE

// router.put("/:id", verify, async (req, res) => {

//   if (req.user.id === req.params.id || req.user.isAdmin) {
//     if (req.body.password) {
//       req.body.password = CryptoJS.AES.encrypt(
//         req.body.password,
//         process.env.SECRET_KEY
//       ).toString();
//     }

//     try {
//       const updatedUser = await User.findByIdAndUpdate(
//         req.params.id,
//         {
//           $set: req.body,
//         },
//         { new: true }
//       );
//       res.status(200).json(updatedUser);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   } else {
//     res.status(403).json("You can update only your account!");
//   }
// });

// //DELETE

// router.delete("/:id", verify, async (req, res) => {
//   if (req.user.id === req.params.id || req.user.isAdmin) {
//     try {
//       await User.findByIdAndDelete(req.params.id);
//       res.status(200).json("User has been deleted...");
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   } else {
//     res.status(403).json("You can delete only your account!");
//   }
// });

// //GET

//  router.get("/find/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const { password, ...info } = user._doc;
//     res.status(200).json(info);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //GET ALL
// router.get("/", verify, async (req, res) => {
//   const query = req.query.new;
//   if (req.user.isAdmin) {
//     try {
//       const users = query
//         ? await User.find().sort({ _id: -1 }).limit(5)
//         : await User.find();
//       res.status(200).json(users);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   } else {
//     res.status(403).json("You are not allowed to see all users!");
//   }
// });

// //GET USER STATS
// router.get("/stats", async (req, res) => {
//   const today = new Date();
//   const latYear = today.setFullYear(today.setFullYear() - 1);
//   try {
//     const data = await User.aggregate([
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//         },
//       },
//       {
//         $group: {
//           _id: "$month",
//           total: { $sum: 1 },
//         },
//       },
//     ]);
//     res.status(200).json(data);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// module.exports = router;
