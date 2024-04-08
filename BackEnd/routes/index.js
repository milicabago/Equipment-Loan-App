const express = require("express");
const router = express.Router();
/** Controllers **/
const { registerOrCreateUser, loginUser, currentUser } = require("../controllers/userController");
/** Middlewares **/
const validateToken = require("../middleware/validateTokenHandler");

/** Routes for all USERS **/
router.post("/login", loginUser);
router.post("/register", registerOrCreateUser); // ograničiti pristup samo adminu
router.get("/current", validateToken, currentUser);
router.get("/logout", (req, res) => res.send("Logout user"));

/** Routes for ADMIN **/
router.use("/admin", validateToken, require("./adminRoutes"));

/** Routes for USER **/
router.use("/user", validateToken, require("./userRoutes"));

module.exports = router;
