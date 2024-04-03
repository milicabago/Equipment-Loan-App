const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  currentUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const {
  createEquipment,
  getAllEquipment,
} = require("../controllers/equipmentController");
const validateToken = require("../middleware/validateTokenHandler");
const checkUserRole = require("../middleware/checkUserHandler");
// Rute za sve korisnike
router.post("/login", loginUser);
// router.post("/settings", settingsUser, validateToken);
// router.get("/logout", logoutUser);

/**  Rute za admina **/
router.get("/admin/dashboard", getAllUsers);
router
  .route("/admin/dashboard/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);
// router.get("/requests", getAllRequests);
// router.get("historyRequests", getAllHistoryRequests);
router.post("/admin/create_user", createUser);

/**  Rute za upolenika **/
// router.post("/create_request", createRequest , checkUserRole("employee"));

// Ako je JWT validan, korisnik može prisupiti podacima na ovoj ruti
router.get("/current", validateToken, currentUser);
// router.post("/current/addUser", createUser);
// router.post("/current/addEquipment", createEquipment);

module.exports = router;
