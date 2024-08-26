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
const { createUser, getAllUsers, getUser, adminUpdateUserOrAdmin, deleteUser, getUserProfile, updateAdminProfile } = require("../controllers/adminController");
const { addEquipment, getAllEquipment, getEquipment, updateEquipment, deleteEquipment } = require("../controllers/equipmentController");

/**** Routes managed by ADMIN ****/

/** Routes for REQUESTS ('active'; 'returned') **/
router.get("/", getAllActiveRequests); // request_status === "active"
router.patch("/:id", deactivateRequest); // return_status_request === "returned" 

/** Routes for REQUESTS ('active'; 'pending'; 'denied') **/
router.get("/requests", getAllPendingRequests); // request_status === "pending"
router.patch("/requests/:id", acceptOrDenyRequest);  // request_status === "active" || request_status === "denied" for assign equipment

/** Route for create USER **/
router.post("/createUser", createUser);

/** Routes for USERS **/
router.get("/users", getAllUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id", adminUpdateUserOrAdmin); // ADMIN can change → USERNAME, ROLE, POSITION
router.delete("/users/:id", deleteUser);

/** Route for add EQUIPMENT **/
router.post("/addEquipment", addEquipment);

/** Routes for EQUIPMENT and EQUIPMENT HISTORY **/
router.get("/equipment", getAllEquipment);
router.get("/equipment/:id", getEquipment);
router.put("/equipment/:id", updateEquipment);
router.delete("/equipment/:id", deleteEquipment);
router.get("/equipmentHistory", getAllEquipmentHistory);
router.delete("/equipmentHistory/:id", deleteRequest);
router.get("/equipmentHistory/deleteHistory", deleteSelectHistory);

/** Routes for profile of ADMIN **/
router.route("/settings").get(getUserProfile)
router.route("/settings/:id").put(updateAdminProfile) // ADMIN cannot change → ROLE

module.exports = router;
