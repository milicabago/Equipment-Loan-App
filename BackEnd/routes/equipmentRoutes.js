const express = require("express");
const router = express.Router();
const {
  getAllEquipment,
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
} = require("../controllers/equipmentController");
const validateToken = require("../middleware/validateTokenHandler");
// Validacija preko tokena (sve rute PRIVATE - ograničene za svakog korisnika)
// Kada su sve rute PRIVATE tada koristimo router.use(ime middleware-a za validaciju token-a)
router.use(validateToken);
/* Dohvati svu opremu (GET) */ /* Kreiraj novu opremu (POST) */
router.route("/admin/dashboard").get(getAllEquipment);
/* Dohvati pojedinacnu opremu po ID-u (GET) */ /* Azuriraj opremu prema ID-u (PUT) */ /* Izbrisi opremu prema ID-u (DELETE) */

router.route("/admin/create_equipment").post(createEquipment);
router
  .route("/admin/dashboard/:id")
  .get(getEquipment)
  .put(updateEquipment)
  .delete(deleteEquipment);

// Rute za uposlanika
router.route("/employee/allEquipment").get(getAllEquipment);

// Rute za slanje zahtjeva za opremom
// router.post("/assign", assignEquipment);

module.exports = router;
