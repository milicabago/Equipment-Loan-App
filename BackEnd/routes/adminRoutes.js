const express = require("express");
const router = express.Router();
/** Controllers **/
const { registerOrCreateUser, getAllUsers, getUser, updateUser, deleteUser } = require("../controllers/userController");
const { getActiveRequests, getPendingRequests, deleteRequest, activateRequest } = require("../controllers/requestController");
const { getAllEquipment, addEquipment, getEquipment, updateEquipment, deleteEquipment } = require("../controllers/equipmentController");

/**** START: Routes for ADMIN --> ****/

/** GET all users with assigned equipment **/
router.get("/dashboard", getActiveRequests);
router.delete("/dashboard/:id", deleteRequest); // Proučiti što uraditi kada uklanjamo zahtjev ili ga postavljamo na 'inactive'

/** GET all requests for ACCEPT or DELETE request **/
router.get("/requests", getPendingRequests);
router.post("/requests/request", activateRequest);
router.delete("/requests/:id", deleteRequest);

/** POST for create new User **/
router.post("/createUser", registerOrCreateUser);

/** GET all users, GET user and DELETE user **/
router.get("/users", getAllUsers);
router.get("/users/:id", getUser);
// router.put("/users/:id", updateUser); // Provjeriti da li će ADMIN moći mijenjati podatke korisnika
router.delete("/users/:id", deleteUser);

/** POST for create new Equipment **/
router.post("/addEquipment", addEquipment);

/** GET all equipment, GET equipment, PUT equipment and DELETE equipment **/
router.get("/equipment", getAllEquipment);
router.get("/equipment/:id", getEquipment);
router.put("/equipment/:id", updateEquipment);
router.delete("/equipment/:id", deleteEquipment);

/** GET user profile by ID **/
router.route("/settings/:id").get(getUser).put(updateUser);

/**** END: <-- Routes for ADMIN ****/

module.exports = router;
