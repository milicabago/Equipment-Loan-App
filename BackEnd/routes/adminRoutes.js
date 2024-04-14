const express = require("express");
const router = express.Router();
/** Controllers **/
const { registerOrCreateUser, getAllUsers, getUser, getUserProfile, adminUpdateUser, updateAdminProfile, deleteUser } = require("../controllers/userController");
const { getActiveRequests, getPendingRequests, deleteRequest, activateRequest, deactivateRequest, deniedRequest } = require("../controllers/requestController");
const { getAllEquipment, addEquipment, getEquipment, updateEquipment, deleteEquipment } = require("../controllers/equipmentController");

/**** Routes for ADMIN ****/

/** GET all users with assigned equipment **/
router.get("/", getActiveRequests); // *****  DODATI ZASEBNO ZA ADMINA -> prikaz svih zaduženih korisnika gdje su zahtjevi === "active" ****
router.patch("/:id", deactivateRequest); // Kada mijenjamo aktivan zahtjev u "returned" jer razužujemo korisnika opreme  --> return_status_request = "returned" 
router.delete("/:id", deleteRequest); // Promijeniti kasnije da se briše iz povijesti --> kada admin razdužuje korisnika opreme 

/** GET all PENDING requests, ACCEPT or DENIED request (PATCH) **/
router.get("/requests", getPendingRequests);
router.patch("/requests/activate/:id", activateRequest); // Aktiviraj zahtjev --> dodjeli opremu korisniku
router.patch("/requests/deny/:id", deniedRequest); // Promijeni status na "denied" ako admin odbije zahtjev

/** POST for create new User **/
router.post("/createUser", registerOrCreateUser);

/** GET all users, GET user, PATCH user and DELETE user **/
router.get("/users", getAllUsers);
router.get("/users/:id", getUser); // Prikazuje više informacija o jednom korisniku
router.patch("/users/:id", adminUpdateUser); // Admin može promijeniti ROLE i POSITION korisnika 
router.delete("/users/:id", deleteUser);

/** POST for create new Equipment **/
router.post("/addEquipment", addEquipment);

/** GET all equipment, GET equipment, PUT equipment and DELETE equipment **/
router.get("/equipment", getAllEquipment);
router.get("/equipment/:id", getEquipment); // Prikazuje više informacija o određenoj opremi
router.put("/equipment/:id", updateEquipment);
router.delete("/equipment/:id", deleteEquipment);

/** GET user profile by ID **/
router.route("/settings").get(getUserProfile) // Prikazuje osobne podatke korisnika
router.route("/settings/:id").put(updateAdminProfile) // Svaki korisnik može promijeniti SAMO osobne podatke profila

module.exports = router;
