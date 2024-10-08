const express = require("express");
const router = express.Router();
/** Controllers **/
const {
    getAllActiveRequests,
    getAllAssignPendingRequests,
    getAllUnassignPendingRequests,
    deactivateRequest,
    acceptOrDenyRequest,
    getAllEquipmentHistory,
    deleteHistoryItem,
    deleteAllHistory } = require("../controllers/adminRequestController");
const { createUser, getAllUsers, getUser, adminUpdateUserOrAdmin, deleteUser, getAdminProfile, updateAdminProfile } = require("../controllers/adminController");
const { addEquipment, getAllEquipment, getEquipment, updateEquipment, deleteEquipment } = require("../controllers/equipmentController");

/**** Routes managed by ADMIN ****/

/** Routes for REQUESTS ('active'; 'returned') **/
router.get("/", getAllActiveRequests); // request_sta   tus === "active"
router.patch("/:id", deactivateRequest); // return_status_request === "returned" 

/** Routes for REQUESTS ('active'; 'pending'; 'denied') **/
router.get("/requests/assignPendingRequests", getAllAssignPendingRequests); // request_status === "pending"
router.get("/requests/unassignPendingRequests", getAllUnassignPendingRequests); // request_status === "denied"
router.patch("/requests/:id", acceptOrDenyRequest);  // request_status === "active" || request_status === "denied" for assign equipment

/** Routes for USERS **/
router.get("/users", getAllUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id", adminUpdateUserOrAdmin); // ADMIN can change → USERNAME, ROLE, POSITION
router.delete("/users/:id", deleteUser);

/** Routes for EQUIPMENT **/
router.get("/equipment", getAllEquipment);
router.get("/equipment/:id", getEquipment);
router.put("/equipment/:id", updateEquipment);
router.delete("/equipment/:id", deleteEquipment);;

/** Route for create USER **/
router.post("/createUser", createUser);

/** Route for add EQUIPMENT **/
router.post("/addEquipment", addEquipment);

/** Routes for HISTORY **/
router.get("/history", getAllEquipmentHistory);
router.delete("/history/deleteAllHistory", deleteAllHistory)
router.delete("/history/:id", deleteHistoryItem);

/** Routes for profile of ADMIN **/
router.route("/settings").get(getAdminProfile)
router.route("/settings/:id").put(updateAdminProfile) // ADMIN cannot change → ROLE

module.exports = router;
