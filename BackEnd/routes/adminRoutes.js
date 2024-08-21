const express = require("express");
const router = express.Router();
/** Controllers **/
const {
    getAllActiveRequests,
    getAllPendingRequests,
    deactivateRequest,
    acceptOrDenyRequest,
    getAllEquipmentHistory,
    deleteRequest,
    deleteSelectHistory } = require("../controllers/adminRequestController");
const { createUser, getAllUsers, getUser, adminUpdateUser, deleteUser, getUserProfile, updateAdminProfile } = require("../controllers/adminController");
const { addEquipment, getAllEquipment, getEquipment, updateEquipment, deleteEquipment } = require("../controllers/equipmentController");

/**** Routes for ADMIN ****/

/** GET all active requests with assigned equipment **/
/** PATCH request to unassign equipment **/
router.get("/", getAllActiveRequests); // request_status === "active"
router.patch("/:id", deactivateRequest); // return_status_request === "returned" 

/** GET all PENDING requests **/
/** ACCEPT or DENY request for equipment **/
router.get("/requests", getAllPendingRequests); // request_status === "pending"
router.patch("/requests/:id", acceptOrDenyRequest);  // request_status === "active" | request_status === "denied"

/** POST for create new User **/
router.post("/createUser", createUser);

/** GET all users **/
/** GET one user **/
/** PATCH user data (ADMIN can change → EMAIL, ROLE, POSITION) **/
/** DELETE user **/
router.get("/users", getAllUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id", adminUpdateUser);
router.delete("/users/:id", deleteUser);

/** POST for create new Equipment **/
router.post("/addEquipment", addEquipment);

/** GET all equipment **/
/** GET equipment **/
/** PUT equipment **/
/** DELETE equipment **/
/** GET equipment history **/
/** DELETE request from history **/
router.get("/equipment", getAllEquipment);
router.get("/equipment/:id", getEquipment);
router.put("/equipment/:id", updateEquipment);
router.delete("/equipment/:id", deleteEquipment);
router.get("/equipmentHistory", getAllEquipmentHistory);
router.delete("/equipmentHistory/:id", deleteRequest);
router.get("/equipmentHistory/deleteHistory", deleteSelectHistory);

/** GET admin profile data **/
/** PUT admin profile by ID **/
router.route("/settings").get(getUserProfile)
router.route("/settings/:id").put(updateAdminProfile) // ADMIN cannot change → ROLE

module.exports = router;
