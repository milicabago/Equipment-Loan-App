const express = require("express");
const router = express.Router();
/** Controllers **/
const { registerOrCreateUser, loginUser, currentUser } = require("../controllers/userController");
const { forgotPassword, resetPassword } = require("../controllers/authController");
/** Middlewares **/
const validateToken = require("../middleware/validateTokenHandler");
const { checkAdmin, checkUser } = require("../middleware/checkRoleHandler");

/** Routes for all USERS **/
router.post("/login", loginUser);
router.post("/register", registerOrCreateUser);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:userId/:token", validateToken, resetPassword);

/** Test route **/
router.get("/current", validateToken, currentUser);

/** Routes for ADMIN **/
router.use("/admin", validateToken, checkAdmin, require("./adminRoutes"));

/** Routes for USER **/
router.use("/user", validateToken, checkUser, require("./userRoutes"));

module.exports = router;