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
    deleteRequest } = require("../controllers/userRequestController");
const { getAllEquipment, getEquipment } = require("../controllers/equipmentController");
const { getUserProfile, updateUserProfile } = require("../controllers/userController");

/**** Routes for USER (EMPLOYEE OF THE COMPANY) ****/

/** GET active requests with assigned equipment for each USER **/
/** PATCH notification-request to unassign equipment **/
router.get("/", getActiveRequests); // request_status === "active"
router.post("/unassignEquipment", unassignEquipmentRequest); // SLANJE obavijesti da želi razdužiti opremu

/** GET all equipment **/
/** GET all PENDING requests for equipment **/
/** GET one equipment **/
router.get("/equipment", getAllEquipment);
router.get("/equipment/pendingRequests", getPendingRequests);
router.get("/equipment/:id", getEquipment);

/** POST request for equipment **/
/** PATCH request for equipment → USER edits a submitted request and resubmits it or cancels it **/
/** GET equipment history for each USER **/
/** DELETE request from history **/
router.post("/equipment/request", assignEquipment); // request_status = "pending"
router.patch("/equipment/request/:id", cancelEquipmentRequest); // Korisnik uređuje poslan zahtjev i šalje ga ponovno ili ga poništava
router.get("/equipmentHistory", getEquipmentHistory);
router.delete("/equipmentHistory/:id", deleteRequest);

/** GET user profile data **/
/** PUT user profile by ID **/
router.route("/settings").get(getUserProfile);
router.route("/settings/:id").put(updateUserProfile); // USER can only change personal data

module.exports = router;
