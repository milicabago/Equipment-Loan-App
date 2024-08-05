const asyncHandler = require("express-async-handler");
const Joi = require("joi");
/** Models **/
const User = require("../models/userModel");
const Equipment = require("../models/equipmentModel");
const Request = require("../models/userEquipmentModel");
/** Constants **/
const { UserEquipmentStatus } = require("../constants");

/**** Requests managed by USER ****/

/**
 * @desc Get Active requests for current user
 * @route GET /api/user/
 * @access private
 */
const getActiveRequests = asyncHandler(async (req, res) => {
  const userId = req.user.user._id;

  // Pronađi sve aktivne zahtjeve, tj. zaduženu opremu koja je povezana s prijavljenim korisnikom
  const requests = await Request.find({ user_id: userId, request_status: UserEquipmentStatus.ACTIVE }).sort({ assign_date: 1 });

  // Provjeri jesu li pronađeni zahtjevi
  if (!requests || requests.length === 0) {
    res.status(404);
    throw new Error("There is no active equipment assigned to the current user!");
  }

  // Iteriraj kroz sve zahtjeve i dohvati informacije o korisnicima
  for (const request of requests) {
    // Pronađi informacije o opremi na temelju equipment_id
    const equipment = await Equipment.findById(request.equipment_id);
    // Ako je oprema pronađena, dodaj informacije o opremi u zahtjev
    if (equipment) {
      request.equipment_info = {
        name: equipment.name,
        serial_number: equipment.serial_number
      };
    }
  }

  // Dodaj user_info na kraj svakog zahtjeva
  const response = requests.map(request => {
    return {
      ...request._doc,
      equipment_info: request.equipment_info,
    };
  });

  res.status(200).json(response);
});

/**
 * @desc Get all Pending requests for user
 * @route GET /api/user/equipment/pendingRequests
 * @access private
 */
const getPendingRequests = asyncHandler(async (req, res) => {
  // Dohvati ID trenutnog korisnika
  const userId = req.user.user._id;

  // Pronađi sve zahtjeve koji su u statusu "pending"
  const requests = await Request.find({ user_id: userId, request_status: UserEquipmentStatus.PENDING }).sort({ assign_date: 1 });

  // Provjeri jesu li pronađeni zahtjevi
  if (!requests || requests.length === 0) {
    res.status(404);
    throw new Error("There are no pending requests!");
  }

  // Iteriraj kroz sve zahtjeve i dohvati informacije o korisnicima
  for (const request of requests) {

    // Pronađi informacije o opremi na temelju equipment_id
    const equipment = await Equipment.findById(request.equipment_id);
    // Ako je oprema pronađena, dodaj informacije o opremi u zahtjev
    if (equipment) {
      request.equipment_info = {
        name: equipment.name,
        serial_number: equipment.serial_number
      };
    }
  }

  // Dodaj user_info na kraj svakog zahtjeva
  const response = requests.map(request => {
    return {
      ...request._doc,
      equipment_info: request.equipment_info,
    };
  });

  res.status(200).json(response);
});

/**
 * @desc Request equipment assignment
 * @route POST /api/user/equipment/request
 * @access private
 */
const assignEquipment = asyncHandler(async (req, res) => {
  const { equipment_id, input_quantity } = req.body;

  // Pronađi opremu po ID-u
  const equipment = await Equipment.findById(equipment_id);
  if (!equipment) {
    return res.status(404).json({ message: "Equipment not found!" });
  }

  // Validation schema
  const assignEquipmentSchema = Joi.object({
    equipment_id: Joi.string().required(), // zbog testiranja staviti equipment_id
    input_quantity: Joi.number().integer().min(1).required()
  });

  // Validirajte ulazne podatke koristeći definiranu Joi shemu
  const { error } = assignEquipmentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ message: errorMessages.join(', ') });
  }

  // Provjeri dostupnost opreme
  if (equipment.quantity === 0) {
    res.status(400);
    throw Error("Equipment is not available for assignment!");
  }

  // Provjeri dostupnu količinu opreme na stanju
  if (input_quantity > equipment.quantity) {
    res.status(400);
    throw Error("Not enough equipment available for assignment!");
  }

  const userId = req.user.user._id;
  // Provjeri je li korisnik već poslao zahtjev za ovu opremu
  const existingRequest = await Request.findOne({ user_id: userId, equipment_id, request_status: UserEquipmentStatus.PENDING });
  if (existingRequest) {
    res.status(400);
    throw Error("You have already sent a request for this equipment!");
  }

  // Ako je oprema dostupna stavi zahtjev na "pending" -> stvoranje novog zahtjeva za zaduženje opreme
  const newRequest = new Request({
    user_id: req.user.user._id,
    equipment_id: equipment._id,
    quantity: input_quantity,
    request_status: UserEquipmentStatus.PENDING,
    assign_date: new Date(),
  });

  try {
    // Spremi novi zahtjev u bazu podataka
    await newRequest.save();

    // Smanji količinu dostupne opreme za količinu koju je korisnik unio
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

/**
 * @desc Unassign equipment
 * @route PATCH /api/user/:id
 * @access private
 */
const unassignEquipment = asyncHandler(async (req, res) => {
  // Pronađi opremu po ID-u
  const userEquipment = await Request.findById(req.params.id);
  const equipmentQuantity = await Equipment.findById(userEquipment.equipment_id);

  if (!userEquipment) {
    res.status(404);
    throw new Error("Assigned equipment not found!");
  }

  // Validation schema
  const unassignEquipmentSchema = Joi.object({
    unassigned_quantity: Joi.number().integer().min(1).required()
  });

  // Validacija podataka koristeći definiranu Joi shemu
  const { error } = unassignEquipmentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
  }

  // Provjera autorizacije
  if (userEquipment.user_id.toString() !== req.user.user._id) {
    res.status(403);
    throw new Error("User doesn't have permission to unassign this equipment!");
  }

  const unassignedQuantity = req.body.unassigned_quantity;
  if (unassignedQuantity > userEquipment.quantity) {
    res.status(400);
    throw new Error("Please enter a valid quantity for unassigning equipment!");
  }

  // Smanji količinu zaduzene opreme
  userEquipment.quantity -= unassignedQuantity;
  // Povećaj količinu razdužene opreme
  userEquipment.unassigned_quantity += unassignedQuantity;

  // Ako je količina dostupne opreme nakon razduživanja 0, postavi status na "inactive"
  if (userEquipment.quantity === 0) {
    userEquipment.return_status_request = UserEquipmentStatus.RETURNED;
    userEquipment.request_status = UserEquipmentStatus.INACTIVE;
    userEquipment.unassign_date = new Date();

    // Povećaj količinu dostupne opreme u bazi (nakon razduživanja korisnika)
    if (equipmentQuantity) {
      equipmentQuantity.quantity += req.body.unassigned_quantity;
      await equipmentQuantity.save();
    }
    res.status(200).json({ message: "User has returned all equipment.", request: userEquipment });
  }

  // Spremi promjene u bazu podataka
  const updatedUserEquipment = await userEquipment.save();

  res.status(200).json({ message: "Equipment unassigned successfully.", updatedUserEquipment });
});

/**
 * @desc Cancel equipment request
 * @route PATCH /api/user/equipment/request/:id
 * @access private
 */
const cancelEquipmentRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const request = await Request.findById(requestId);
  if (!request) {
    res.status(404);
    throw new Error("Request not found!");
  }

  const equipmentQuantity = await Equipment.findById(request.equipment_id);

  // Provjeri je li zahtjev u statusu "pending"
  if (request.request_status !== UserEquipmentStatus.PENDING) {
    res.status(400);
    throw new Error("Request is not pending!");
  }

  // Provjera autorizacije
  if (request.user_id.toString() !== req.user.user._id) {
    res.status(403);
    throw new Error("User doesn't have permission to cancel this request!");
  }

  // Povećaj količinu dostupne opreme
  if (equipmentQuantity) {
    equipmentQuantity.quantity += request.quantity;
    await equipmentQuantity.save();
  }

  // Postavi status zahtjeva na "canceled"
  request.request_status = UserEquipmentStatus.INACTIVE;
  request.return_status_request = UserEquipmentStatus.CANCELED;
  request.unassign_date = new Date();

  // Spremi promjene u bazu podataka
  const updatedUserEquipment = await request.save();

  res.status(200).json({ message: "Equipment request canceled successfully.", updatedUserEquipment });
});

/**
 * @desc Get history for returned equipment
 * @route GET /api/user/equipmentHistory
 * @access private
 */
const getEquipmentHistory = asyncHandler(async (req, res) => {
  // Izvrši upit u bazu podataka za dohvat razdužene opreme
  const historyData = await Request.find({
    user_id: req.user.user._id,
    $or: [
      { return_status_request: UserEquipmentStatus.RETURNED },
      { return_status_request: UserEquipmentStatus.CANCELED }
    ]
  }).sort({ unassign_date: -1 });

  // Provjeri je li pronađena povijest opreme za trenutnog korisnika
  if (!historyData || historyData.length === 0) {
    res.status(404);
    throw new Error("Equipment history not found for the current user!");
  }

  // Iteriraj kroz sve zahtjeve i dohvati informacije o opremi
  for (const history of historyData) {
    // Pronađi informacije o opremi na temelju equipment_id
    const equipment = await Equipment.findById(history.equipment_id);
    // Ako je oprema pronađena, dodaj informacije o opremi u povijest
    if (equipment) {
      history.equipment_info = {
        name: equipment.name,
        serial_number: equipment.serial_number,
        quantity: equipment.quantity
      };
    }
  }

  // Stvori odgovor s dodanim informacijama o korisnicima i opremi
  const response = historyData.map(history => {
    return {
      ...history._doc,
      equipment_info: history.equipment_info
    };
  });

  // Vrati odgovor s povijesti opreme
  res.status(200).json(response);
});

/**
 * @desc Delete request from History
 * @route DELETE /api/admin/:id
 * @access private
 */
const deleteRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  try {
    if (!request) {
      res.status(404);
      throw new Error("Request not found!");
    }

    // Provjeri je li status zahtjeva "canceled" ili "returned"
    if (request.return_status_request === UserEquipmentStatus.CANCELED || request.return_status_request === UserEquipmentStatus.RETURNED
      || request.request_status === UserEquipmentStatus.DENIED
    ) {
      // Obriši zahtjev iz baze
      const deletedRequest = await Request.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Request deleted successfully", deletedRequest });
    } else {
      res.status(400);
      throw new Error("Request status is not 'canceled' or 'returned'!");
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  getActiveRequests,
  getPendingRequests,
  assignEquipment,
  unassignEquipment,
  cancelEquipmentRequest,
  getEquipmentHistory,
  deleteRequest,
};
