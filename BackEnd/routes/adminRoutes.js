const express = require("express");
const router = express.Router();
/** Controllers **/
const { registerOrCreateUser, getAllUsers, getUser, updateUser, deleteUser } = require("../controllers/userController");
const { getActiveRequests, getPendingRequests, deleteRequest, activateRequest } = require("../controllers/requestController");
const { getAllEquipment, addEquipment, getEquipment, updateEquipment, deleteEquipment } = require("../controllers/equipmentController");

/**** START: Routes for ADMIN --> ****/

/** GET all users with assigned equipment **/
router.get("/", getActiveRequests);
router.patch("/:id", /* deactivateRequest */); // Kada mijenjamo aktivan zahtjev u "returned" jer razužujemo korisnika opreme  --> return_status_request = "return" 
router.delete("/:id", deleteRequest); // Kada uklanjamo zahtjev 

/** GET all requests for ACCEPT or DELETE request **/
router.get("/requests", getPendingRequests);
router.post("/requests/request", activateRequest);
router.patch("/requests/:id", /* denidedRequest */); // promijeni status na "denied"

/** POST for create new User **/
router.post("/createUser", registerOrCreateUser);

/** GET all users, GET user and DELETE user **/
router.get("/users", getAllUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id", updateUser); // patch --> Promijenit neke dijelove 
router.delete("/users/:id", deleteUser);

/** POST for create new Equipment **/
router.post("/addEquipment", addEquipment);

/** GET all equipment, GET equipment, PUT equipment and DELETE equipment **/
router.get("/equipment", getAllEquipment);
router.get("/equipment/:id", getEquipment);
router.put("/equipment/:id", updateEquipment);
router.delete("/equipment/:id", deleteEquipment);

/** GET user profile by ID **/
router.route("/settings/:id").get(getUser)/* .patch(adminUpdateUser); */ // adminuUpdateUser kreirati

/**** END: <-- Routes for ADMIN ****/

module.exports = router;
