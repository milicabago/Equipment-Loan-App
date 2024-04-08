const asyncHandler = require("express-async-handler");
const Equipment = require("../models/equipmentModel");
const Request = require("../models/userEquipmentModel");

/** START: ADMIN --> **/

// @desc Get all Active requests (Users + Equipment)
// @route GET /api/admin/dashboard
// @access public
const getActiveRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ request_status: "active" });
  res.status(200).json(requests);
});

// @desc Get all Pending requests (Users + Equipment)
// @route GET /api/admin/requests
// @access public
const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ request_status: "pending" });
  res.status(200).json(requests);
});

// @desc Delete request
// @route DELETE /api/admin/requests/:id
// @access public
const deleteRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id)
  try {
    if (!request) {
      res.status(404);
      throw new Error("Request not found!");
    }
    // Obriši zahtjev iz baze
    const deleteRequest = await Request.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Request deleted successfully", deleteRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Activate request
// @route POST /api/admin/requests/request
// @access public
const activateRequest = asyncHandler(async (req, res) => {
  // Pronađi zahtjev po ID-u
  const request = await Request.findById(req.params.id);

  // Provjeri postoji li zahtjev s tim ID-om
  if (!request) {
    res.status(404).json({ message: "Request not found" });
    return;
  }
  // Ažuriraj status zahtjeva na "active"
  request.request_status = "active";
  await request.save();

  res.status(200).json({ message: "Request activated successfully.", request });
});

/** END: <-- ADMIN **/

/** START: USER --> **/

// @desc Request equipment assignment
// @route POST /api/user/equipment/request
// @access Public
const assignEquipment = asyncHandler(async (req, res) => {
  const { equipment_id, quantity } = req.body;
  // Pronađi opremu po ID-u
  const equipment = await Equipment.findById(equipment_id);
  if (!equipment) {
    return res.status(404).json({ message: "Equipment not found" });
  }

  // Provjeri dostupnost opreme
  if (equipment.quantity === 0) {
    res.status(400);
    throw Error("Equipment is not available for assignment");
  } else if (quantity <= 0) {
    res.status(400);
    throw Error("Please enter a valid quantity");
  }
  // Provjeri dostupnu količinu opreme na stanju
  const availableQuantity = equipment.quantity;
  if (quantity > availableQuantity) {
    res.status(400);
    throw Error("Not enough equipment available for assignment!");
  }

  // Ako je oprema dostupna i nema već aktivnog zahtjeva, stvori novi zahtjev za zaduženje opreme
  const newRequest = new Request({
    user_id: req.user.id,
    equipment_id: equipment._id,
    quantity: quantity,
    request_status: "pending",
    assign_date: new Date(),
  });

  // Spremi novi zahtjev u bazu podataka
  await newRequest.save();

  // Smanji količinu dostupne opreme za količinu koju je korisnik odabrao
  equipment.quantity -= quantity;
  await equipment.save();

  // Pošalji odgovor s odgovarajućom porukom
  res.status(200).json({ message: "Equipment assignment request sent successfully", request: newRequest });
});

// @desc Unsign equipment
// @route PUT /api/user/dashboard/:id
// @access public
const unassignEquipment = asyncHandler(async (req, res) => {
  // Pronađi opremu po ID-u
  const userEquipment = await Request.findById(req.params.id);
  if (!userEquipment) {
    res.status(404);
    throw new Error("Assigned equipment not found!");
  }

  // Postavi datum razduženja na trenutni datum i vrijeme
  userEquipment.unassign_date = new Date();

  // Smanji količinu zaduzene opreme
  const unassignedQuantity = req.body.unassigned_quantity;
  if (unassignedQuantity > userEquipment.quantity) {
    res.status(400);
    throw new Error("Please enter a valid quantity less than or equal to the assigned quantity!");
  }
  userEquipment.quantity -= unassignedQuantity;

  // Povećaj količinu razdužene opreme
  userEquipment.unassigned_quantity += unassignedQuantity;

  // Ako je količina dostupne opreme nakon razduživanja 0, postavi status na "inactive"
  if (userEquipment.quantity === 0) {
    userEquipment.request_status = "inactive";
  }
  // Spremi promjene u bazu podataka
  const updatedUserEquipment = await userEquipment.save();

  res.status(200).json({ message: "Equipment unassigned successfully.", updatedUserEquipment });
});


// @desc Get equipment history
// @route GET /api/user/equipmentHistory
// @access public
const getEquipmentHistory = asyncHandler(async (req, res) => {
  // Izvrši upit u bazu podataka za dohvat razdužene opreme
  const history = await Request.find({ request_status: "inactive" }).sort({ unassign_date: -1 });

  if (!history) {
    res.status(404);
    throw new Error("Equipment history not found!");
  }

  // Vrati podatke o povijesti opreme
  res.status(200).json(history);
});

/** END: <-- USER **/

module.exports = {
  getActiveRequests,
  getPendingRequests,
  activateRequest,
  deleteRequest,
  unassignEquipment,
  assignEquipment,
  getEquipmentHistory
};
