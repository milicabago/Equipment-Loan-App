const express = require("express");
const router = express.Router();
/** Controllers **/
const { registerUser, loginUser, forgotPassword, resetPassword, currentUser } = require("../controllers/authController");
const { createNotification, getNotifications, deleteNotification, readNotification } = require("../controllers/notificationController");
/** Middlewares **/
const validateToken = require("../middleware/validateTokenHandler");
const { checkAdmin, checkUser } = require("../middleware/checkRoleHandler");

/** Routes for all types of USERS **/
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:userId/:token", validateToken, resetPassword);

/** Test route **/
router.get("/current", validateToken, currentUser);

/** Routes for ADMIN **/
router.use("/admin", validateToken, checkAdmin, require("./adminRoutes"));

/** Routes for USER **/
router.use("/user", validateToken, checkUser, require("./userRoutes"));

/** Routes for Notifications **/
router.post("/notifications", validateToken, createNotification);
router.get("/allNotifications", validateToken, getNotifications);
router.delete("/notifications/:id", validateToken, deleteNotification);
router.patch("/notifications/:id/read", validateToken, readNotification);

module.exports = router;