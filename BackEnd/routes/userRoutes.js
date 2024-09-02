const express = require("express");
const router = express.Router();
/** Controllers **/
const {
    getActiveRequests,
    getAssignPendingRequests,
    getUnassignPendingRequests,
    assignEquipmentRequest,
    unassignEquipmentRequest,
    cancelOrUpdateEquipmentRequest,
    getHistory,
    deleteHistoryItem,
    deleteAllHistory } = require("../controllers/userRequestController");
const { getAllEquipment, getEquipment } = require("../controllers/equipmentController");
const { getUserProfile, updateUserProfile } = require("../controllers/userController");

/**** Routes managed by USER (EMPLOYEE OF THE COMPANY) ****/

/** Routes fot REQUESTS ('active') and UNASSIGN REQUEST  **/
router.get("/", getActiveRequests); // request_status === "active"
router.post("/unassignEquipment", unassignEquipmentRequest); // return_status_request === "pending"

/** Routes for REQUESTS ('pending'; 'canceled') **/
router.get("/requests/assignPendingRequests", getAssignPendingRequests);
router.get("/requests/unassignPendingRequests", getUnassignPendingRequests);
router.patch("/requests/:id", cancelOrUpdateEquipmentRequest); // request_status = "pending" || return_status_request = "canceled"

/** Routes for EQUIPMENT and ASSIGN REQUEST ('pending') **/
router.get("/equipment", getAllEquipment);
router.post("/equipment/assignEquipment", assignEquipmentRequest); // request_status = "pending"
router.get("/equipment/:id", getEquipment);

/** Routes for HISTORY **/
router.get("/history", getHistory);
router.delete("/history/deleteAllHistory", deleteAllHistory);
router.delete("/history/:id", deleteHistoryItem);

/** Routes for profile of USER **/
router.route("/settings").get(getUserProfile);
router.route("/settings/:id").put(updateUserProfile); // USER can only change personal data

module.exports = router;
