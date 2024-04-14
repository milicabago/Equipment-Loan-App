const express = require("express");
const router = express.Router();
/** Controllers **/
const { registerOrCreateUser, loginUser, currentUser } = require("../controllers/userController");
/** Middlewares **/
const validateToken = require("../middleware/validateTokenHandler");
const { checkAdmin, checkUser } = require("../middleware/checkRoleHandler");

/** Routes for all USERS **/
router.post("/login", loginUser);
router.post("/register", registerOrCreateUser); // Default --> role === "user"
router.get("/current", validateToken, currentUser); // Provjerava trenutno prijavljenog korisnika
router.get("/logout", (req, res) => res.send("Logout user"));

/** Routes for ADMIN **/
router.use("/admin", validateToken, checkAdmin, require("./adminRoutes"));

/** Routes for USER **/
router.use("/user", validateToken, checkUser, require("./userRoutes"));

module.exports = router;