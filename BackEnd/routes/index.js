const express = require("express");
const router = express.Router();

// Home routes
router.use("/", require("./home"));

// Login routes
router.use("/login", require("../controllers/loginController"));

// Admin routes
router.use("/admin", require("./admin"));

// Employee routes
router.use("/employee", require("./employee"));

router.use("/logout", require("./logout"));

module.exports = router;
