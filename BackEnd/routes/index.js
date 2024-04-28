const express = require("express");
const router = express.Router();
/** Controllers **/
const { createUser, loginUser, currentUser } = require("../controllers/userController");
/** Middlewares **/
const validateToken = require("../middleware/validateTokenHandler");
const { checkAdmin, checkUser } = require("../middleware/checkRoleHandler");

/** Routes for all USERS **/
router.post("/login", loginUser);
router.get("/current", validateToken, currentUser);

/** Routes for ADMIN **/
router.use("/admin", validateToken, checkAdmin, require("./adminRoutes"));

/** Routes for USER **/
router.use("/user", validateToken, checkUser, require("./userRoutes"));

module.exports = router;