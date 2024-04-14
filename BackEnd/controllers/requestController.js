const asyncHandler = require("express-async-handler");
//** Models **/
const Equipment = require("../models/equipmentModel");
const Request = require("../models/userEquipmentModel");
const { UserEquipmentStatus } = require("../constants");

/** START: ADMIN --> **/

// @desc Get all Active requests (Users + Equipment)
// @route GET /api/admin/ *//* @route GET /api/user/
// @access private
const getActiveRequests = asyncHandler(async (req, res) => {
  const userId = req.user.user._id; // Dohvat ID-ja prijavljenog korisnika

  // Pronađi sve aktivne zahtjeve, tj. zaduženu opremu koja je povezana s prijavljenim korisnikom
  const requests = await Request.find({ user_id: userId, request_status: UserEquipmentStatus.ACTIVE });

  // Provjeri jesu li pronađeni zahtjevi
  if (!requests || requests.length === 0) {
    res.status(404);
    throw new Error("There is no active equipment assigned to the current user!");
  }

  res.status(200).json(requests);
});


// @desc Get all Pending requests (Users + Equipment)
// @route GET /api/admin/requests
// @access private
const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ request_status: "pending" });
  res.status(200).json(requests);
});

/** DODATI REQUEST za DENIDED umjasto DELETE**/
/** VIDJETI DA LI ADMIN MOŽE BRISATI, možda napraviti za razdužene da idu u povijest i tamo ih briše **/
// @desc Delete request
// @route DELETE /api/admin/...???
// @access private
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
// @route PATCH /api/admin/requests/:id
// @access private
const activateRequest = asyncHandler(async (req, res) => {
  try {
    // Pronađi zahtjev po ID-u
    const request = await Request.findById(req.params.id);

    // Provjeri postoji li zahtjev s tim ID-om
    if (!request) {
      res.status(404).json({ message: "Request not found!" });
      return;
    }
    // Ažuriraj status zahtjeva na "active"
    request.request_status = UserEquipmentStatus.ACTIVE;
    request.assign_date = new Date();
    await request.save();

    res.status(200).json({ message: "Request activated successfully.", request });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});

// @desc Deactivate request for assigned equipment
// @route PATCH /api/admin/:id
// @access private
const deactivateRequest = asyncHandler(async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    // Provjeri je li zahtjev pronađen
    if (!request) {
      res.status(404).json({ message: "Request not found!" });
      return;
    }

    // Smanji ukupnu količinu opreme u zahtjevu za količinu koja se razdužuje
    request.unassigned_quantity += req.body.unassigned_quantity;
    request.quantity -= req.body.unassigned_quantity;

    // Ažuriraj podatke samo ako je poslani unassigned_quantity veći od nule i cijeli broj
    if (req.body.unassigned_quantity && Number.isInteger(req.body.unassigned_quantity) && req.body.unassigned_quantity > 0) {
      request.unassign_date = new Date();
    } else {
      res.status(400).json({ message: "Please enter a valid quantity to unassign equipment!" });
      return;
    }

    // Kada razdužujemo korisnika opreme ako broj nije ispravan, tj. oduzimamo više opreme nego što je zaduženo

    // PROVJERITI DA LI JE POTREBNO *************
    /*
    if (request.quantity <= 0) { // Kada broj razdužene opreme koji se unosi nije ispravan
      res.status(400).json({ message: "Please enter a valid quantity to unassign equipment!" });
      return;
    }
    */

    // Kada razdužimo korisnika opreme
    if (request.quantity === 0) {
      request.return_status_request = UserEquipmentStatus.RETURNED;
      request.request_status = UserEquipmentStatus.INACTIVE;
      res.status(200).json({ message: "User has returned all equipment.", request });
    }

    // Spremi promjene
    const changeRequestStatus = await request.save();

    // Vrati ažurirani zahtjev
    res.status(200).json({ message: "Request status updated to returned.", changeRequestStatus });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});

// @desc Deny request
// @route PATCH /api/admin/requests/:id
// @access private
const deniedRequest = asyncHandler(async (req, res) => {
  try {
    // Pronađi zahtjev po ID-u
    const request = await Request.findById(req.params.id);

    // Provjeri postoji li zahtjev s tim ID-om
    if (!request) {
      res.status(404).json({ message: "Request not found!" });
      return;
    }

    // Provjeri je li zahtjev već u statusu "DENIED"
    if (request.request_status === UserEquipmentStatus.DENIED) {
      return res.status(400).json({ message: "Request is already denied!" });
    }

    // Postavi status zahtjeva na "DENIED"
    request.request_status = UserEquipmentStatus.DENIED;

    // Ažuriraj status zahtjeva
    await request.save();

    res.status(200).json({ message: "Request denied.", request });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Internal Server Error");
  }
});


/** END: <-- ADMIN **/

/** START: USER --> **/

// @desc Request equipment assignment
// @route POST /api/user/equipment/request
// @access private
const assignEquipment = asyncHandler(async (req, res) => {
  const { equipment_id, input_quantity } = req.body;

  // Pronađi opremu po ID-u
  const equipment = await Equipment.findById(equipment_id);
  if (!equipment) {
    return res.status(404).json({ message: "Equipment not found!" });
  }

  // Provjeri dostupnost opreme
  if (equipment.quantity === 0) {
    res.status(400);
    throw Error("Equipment is not available for assignment!");
  } else if (input_quantity <= 0) {
    res.status(400);
    throw Error("Please enter a valid quantity!");
  }
  // Provjeri dostupnu količinu opreme na stanju
  if (input_quantity > equipment.quantity) {
    res.status(400);
    throw Error("Not enough equipment available for assignment!");
  }

  // Provjeri je li korisnik već poslao zahtjev za ovu opremu
  const existingRequest = await Request.findOne({ user_id: req.user.user._id, equipment_id, request_status: "pending" });
  if (existingRequest) {
    res.status(400);
    throw Error("You have already sent a request for this equipment!");
  }

  // Ako je oprema dostupna stavi zahtjev na "pending" -> stvoranje novog zahtjeva za zaduženje opreme
  const newRequest = new Request({
    user_id: req.user.user._id,
    equipment_id: equipment._id,
    quantity: input_quantity,
    request_status: "pending",
    assign_date: new Date(),
  });

  try {
    // Spremi novi zahtjev u bazu podataka
    await newRequest.save();

    // Smanji količinu dostupne opreme za količinu koju je korisnik odabrao
    equipment.quantity -= input_quantity;
    await equipment.save();

    /** OBAVIJESTI **/
    // Pošalji obavijest korisniku o uspješnom slanju zahtjeva
    // Logika slanja obavijesti korisniku, na primjer putem emaila ili push notifikacija

    // Pošalji obavijest administratoru o novom zahtjevu
    // Logika slanja obavijesti administratoru, na primjer putem emaila ili push notifikacija
    /** OBAVIJESTI **/

    // Pošalji odgovor s odgovarajućom porukom
    return res.status(200).json({ message: "Equipment assignment request sent successfully.", request: newRequest });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send equipment assignment request.", error: new Error(error) });
  }
});

// @desc Unassign equipment
// @route PATCH /api/user/:id
// @access private
const unassignEquipment = asyncHandler(async (req, res) => {
  // Pronađi opremu po ID-u
  const userEquipment = await Request.findById(req.params.id);
  if (!userEquipment) {
    res.status(404);
    throw new Error("Assigned equipment not found!");
  }

  // Provjera autorizacije
  if (userEquipment.user_id.toString() !== req.user.user._id) {
    res.status(403);
    throw new Error("User doesn't have permission to unassign this equipment!");
  }

  // Postavi datum razduženja na trenutni datum i vrijeme
  userEquipment.unassign_date = new Date();

  // Smanji količinu zaduzene opreme
  const unassignedQuantity = req.body.unassigned_quantity;
  if (unassignedQuantity <= 0 || unassignedQuantity > userEquipment.quantity) {
    res.status(400);
    throw new Error("Please enter a valid quantity for unassigning equipment!");
  }

  userEquipment.quantity -= unassignedQuantity;

  // Povećaj količinu razdužene opreme
  userEquipment.unassigned_quantity += unassignedQuantity;

  // Ako je količina dostupne opreme nakon razduživanja 0, postavi status na "inactive"
  if (userEquipment.quantity === 0) {
    userEquipment.return_status_request = UserEquipmentStatus.RETURNED;
    userEquipment.request_status = UserEquipmentStatus.INACTIVE;
    res.status(200).json({ message: "User has returned all equipment.", request: userEquipment });
  }

  // Spremi promjene u bazu podataka
  const updatedUserEquipment = await userEquipment.save();

  res.status(200).json({ message: "Equipment unassigned successfully.", updatedUserEquipment });
});



// @desc Get history for returned equipment
// @route GET /api/user/equipmentHistory
// @access private
const getEquipmentHistory = asyncHandler(async (req, res) => {
  // Izvrši upit u bazu podataka za dohvat razdužene opreme
  const history = await Request.find({ user_id: req.user.user._id, return_status_request: UserEquipmentStatus.RETURNED }).sort({ unassign_date: -1 });

  // Provjeri je li pronađena povijest opreme za trenutnog korisnika
  if (!history || history.length === 0) {
    res.status(404);
    throw new Error("Equipment history not found for the current user!");
  }

  // Vrati podatke o povijesti opreme
  res.status(200).json(history);
});

/** END: <-- USER **/

module.exports = {
  getActiveRequests,
  getPendingRequests,
  activateRequest,
  deactivateRequest,
  deniedRequest,
  deleteRequest,
  unassignEquipment,
  assignEquipment,
  getEquipmentHistory
};
