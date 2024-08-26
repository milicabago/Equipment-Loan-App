const express = require("express");
const router = express.Router();
/** Controllers **/
const {
    getActiveRequests,
    getPendingRequests,
    assignEquipment,
    unassignEquipmentRequest,
    cancelEquipmentRequest,
    getEquipmentHistory,
    deleteRequest,
    deleteSelectHistory } = require("../controllers/userRequestController");
const { getAllEquipment, getEquipment } = require("../controllers/equipmentController");
const { getUserProfile, updateUserProfile } = require("../controllers/userController");

/**** Routes managed by USER (EMPLOYEE OF THE COMPANY) ****/

/** Routes fot REQUESTS ('active') and send NOTIFICATION with REQUEST for unassign **/
router.get("/", getActiveRequests); // request_status === "active"
router.post("/unassignEquipment", unassignEquipmentRequest); // return_status_request === "pending"

/** Routes for EQUIPMENT and REQUESTS ('pending') **/
router.get("/equipment", getAllEquipment);
router.get("/equipment/pendingRequests", getPendingRequests);
// router.get("/equipment/unassignPendingRequests", getPendingRequests);
router.get("/equipment/:id", getEquipment);

/** Routes for REQUESTS ('pending'; 'canceled') and EQUIPMENT HISTORY **/
router.post("/equipment/request", assignEquipment); // request_status = "pending"
router.patch("/equipment/request/:id", cancelEquipmentRequest); // request_status = "pending" || return_status_request = "canceled"
router.get("/equipmentHistory", getEquipmentHistory);
router.delete("/equipmentHistory/:id", deleteRequest);
router.get("/equipmentHistory/deleteHistory", deleteSelectHistory);

/** Routes for profile of USER **/
router.route("/settings").get(getUserProfile);
router.route("/settings/:id").put(updateUserProfile); // USER can only change personal data

module.exports = router;
