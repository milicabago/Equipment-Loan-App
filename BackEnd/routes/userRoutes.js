const express = require("express");
const router = express.Router();
/** Controllers **/
const { updateUser } = require("../controllers/userController");
const { getActiveRequests, assignEquipment, unassignEquipment, getEquipmentHistory } = require("../controllers/requestController");
const { getAllEquipment, getEquipment } = require("../controllers/equipmentController");

/**** START: Routes for USER (EMPLOYEE OF THE COMPANY) --> ****/

/** GET all users with assigned equipment **/
router.get("/", getActiveRequests);
router.put("/:id", unassignEquipment); // Proučiti što uraditi kada uklanjamo zahtjev ili ga postavljamo na 'inactive'

/** GET all assigned equipment, GET equipment, request for assign and assign eqipment history **/
router.get("/equipment", getAllEquipment);
router.get("/equipment/:id", getEquipment);
router.post("/equipment/request", assignEquipment);
router.get("/equipmentHistory", getEquipmentHistory);

/** GET user profile by ID **/
router.route("/settings/:id").put(updateUser); // ovo je funkcija samo za UPDATE usera

/**** END: <-- Routes for USER ****/

module.exports = router;
