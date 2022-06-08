const router = require("express").Router();
const services = require("../models/services1");
const verifyToken = require("../verifyToken");
const adminUser = require("../models/Admin");
const order = require("../models/order");

// post admin services in the db
// If the middleware not working somewhere just remove it, it will be perfactly working without verifytoken

router.post("/post", async (req, res) => {
  const newService = new services({
    admin_id: req.body.admin_id,
    frequency_order: req.body.frequency_order,
    Services: req.body.Services,
    // service2: req.body.service2,
    // service3: req.body.service3,
    // service4: req.body.service4,
    // service5: req.body.service5,
  });
  try {
    const services = await newService.save();
    res
      .status(200)
      .json({ Result: "your services has been created successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Make isService value "true" in the admin table

router.get("/setIsService/:id", async (req, res) => {
  try {
    const service = await adminUser.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { isService: true } },
      { new: true }
    );
    res
      .status(200)
      .json({ Result: "isService value become true for this dhobi" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get isService value from admin table

router.get("/getIsService/:id", async (req, res) => {
  try {
    const service = await adminUser
      .find({ _id: req.params.id })
      .select("isService");
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get services of admin from db

router.get("/find/:id", async (req, res) => {
  try {
    const service = await services.find({ admin_id: req.params.id });
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all services of admin from service table
router.get("/getServices", async (req, res) => {
  try {
    // const services = await services.find({});
    // const renderServices = [];
    // _.forEach(services, async (service) => {
    //   const totalOrder = await order.countDocuments({
    //     admin_id: service.admin_id,
    //   });
    //   if (service.frequency_order < totalOrder) {
    //     // push to array or sth
    //     renderServices.push(service);
    //   }
    // });
    // res.status(200).json(renderServices);
    // const { id } = req.state.user; // It is example of Admin Id, I am not sure where you can get it.
    // const totalOrder = await order.countDocuments({ admin_id: id });
    // const services = await services.find(
    //   { admin_id: id },
    //   { frequency_order: { $lt: totalOrder } }
    // );
    // const orders = await order.find().count();
    // const service = await services.find();
    // console.log(orders);
    // console.log(service);
    // const { Services, ...info } = service._doc;
    // res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all services of admin from service table
router.get("/get", async (req, res) => {
  try {
    const service = await services.find();
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get frequency about specfic dhobieAdmin service document

router.get("/get/:id", async (req, res) => {
  try {
    const service = await services
      .find({ admin_id: req.params.id })
      .select("frequency_order");
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update frequency of order in service document

router.post("/updateFreqeuncy/:id", async (req, res) => {
  try {
    const orderFrequency = await services.findByIdAndUpdate(
      req.params.id,
      {
        $set: { frequency_order: req.body.frequency_order },
      },
      { new: true }
    );

    res.status(200).json(orderFrequency);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update services
router.put("/updateService/:id", async (req, res) => {
  try {
    const updatedService = await services.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    // res.status(200).json(updatedService);
    res
      .status(200)
      .json({ Result: "Your service has been updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
