const express = require("express");
const router = express.Router();
/** Controllers **/
const { updateUserProfile, getUserProfile } = require("../controllers/userController");
const { getActiveRequests, assignEquipment, unassignEquipment, getEquipmentHistory } = require("../controllers/requestController");
const { getAllEquipment, getEquipment } = require("../controllers/equipmentController");

/**** Routes for USER (EMPLOYEE OF THE COMPANY) ****/

/** GET all users with assigned equipment **/
router.get("/", getActiveRequests); // Kada se korisnik prijavi, prikazuje svu opremu koju ima zaduženu
router.patch("/:id", unassignEquipment); // Kada korisnik razdužuje opremu --> request_status = "inactive" i return_status_request = "returned"

/** GET all assigned equipment, GET equipment, request for assign and assign eqipment history **/
router.get("/equipment", getAllEquipment); // Prikazuje svu dostupnu opremu
router.get("/equipment/:id", getEquipment); // Prikazuje više informacija o određenoj opremi
router.post("/equipment/request", assignEquipment); // Korisnik može zatražiti opremu
router.get("/equipmentHistory", getEquipmentHistory); // Prikazuje povijest razduživanja opreme

/** GET user profile by ID **/
router.route("/settings").get(getUserProfile); // Prikazuje osobne podatke korisnika
router.route("/settings/:id").put(updateUserProfile); // Svaki korisnik može promijeniti SAMO osobne podatke profila

module.exports = router;
