const express = require("express");
const router = express.Router();
/** Controllers **/
const { getAllActiveRequests, getAllPendingRequests, deactivateRequest, acceptOrDeniedRequest } = require("../controllers/adminRequestController");
const { createUser, getAllUsers, getUser, adminUpdateUser, deleteUser, getUserProfile, updateAdminProfile } = require("../controllers/adminController");
const { addEquipment, getAllEquipment, getEquipment, updateEquipment, deleteEquipment } = require("../controllers/equipmentController");

/**** Routes for ADMIN ****/

/** GET all users with assigned equipment **/
router.get("/", getAllActiveRequests); // prikazi sve usere kojima je request_status === "active" (koji su zadužili opremu)
router.patch("/:id", deactivateRequest); // Kada mijenjamo aktivan zahtjev u "returned" jer razužujemo korisnika opreme  --> return_status_request = "returned" 

/** GET all PENDING requests, ACCEPT or DENIED request for equipment **/
router.get("/requests", getAllPendingRequests); // Prikazuje sve zahtjeve koji čekaju na odobrenje
router.patch("/requests/:id", acceptOrDeniedRequest);  // Promijeni statu na "active" ili "denied" --> Admin dodjeljuje opremu korisniku ili odbija zahtjev

/** POST for create new User **/
router.post("/createUser", createUser);

/** GET all users, GET user, PATCH user and DELETE user **/
router.get("/users", getAllUsers);
router.get("/users/:id", getUser); // Prikazuje više informacija o jednom korisniku
router.patch("/users/:id", adminUpdateUser); // Admin može promijeniti EMAIL, USERNAME, ROLE i POSITION korisnika 
router.delete("/users/:id", deleteUser);

/** POST for create new Equipment **/
router.post("/addEquipment", addEquipment);

/** GET all equipment, GET equipment, PUT equipment and DELETE equipment **/
router.get("/equipment", getAllEquipment);
router.get("/equipment/:id", getEquipment); // Prikazuje više informacija o određenoj opremi
router.put("/equipment/:id", updateEquipment);
router.delete("/equipment/:id", deleteEquipment);

/** GET user profile by ID **/
router.route("/settings").get(getUserProfile)
router.route("/settings/:id").put(updateAdminProfile) // Admin može promijeniti sve osim ROLE

module.exports = router;
