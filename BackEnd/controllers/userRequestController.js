const asyncHandler = require("express-async-handler");
const Joi = require("joi");
/** Models **/
const User = require("../models/userModel");
const Equipment = require("../models/equipmentModel");
const Request = require("../models/userEquipmentModel");
const EquipmentHistory = require("../models/equipmentHistoryModel");
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

  // Iterate through all USER requests
  const requests = await Request.find({ user_id: userId, request_status: UserEquipmentStatus.ACTIVE }).sort({ assign_date: 1 });

  // Check if requests are found
  if (!requests || requests.length === 0) {
    res.status(404);
    throw new Error("There is no active equipment assigned to the current user!");
  }

  // Iterate through all requests and get equipment information
  for (const request of requests) {
    // Find equipment information based on equipment_id
    const equipment = await Equipment.findById(request.equipment_id);
    // If equipment is found, add equipment information to the request
    if (equipment) {
      request.equipment_info = {
        name: equipment.name,
        serial_number: equipment.serial_number
      };
    }
  }

  // Add equipment_info to the end of each request
  const response = requests.map(request => {
    return {
      ...request._doc,
      equipment_info: request.equipment_info,
    };
  });

  res.status(200).json(response);
});

/**
 * @desc Get all Pending requests for USER
 * @route GET /api/user/equipment/pendingRequests
 * @access private
 */
const getPendingRequests = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.user._id;

    const pendingRequests = await Request.find({
      user_id: userId,
      request_status: UserEquipmentStatus.PENDING,
    }).sort({ assign_date: 1 });

    if (!pendingRequests || pendingRequests.length === 0) {
      res.status(404);
      throw new Error("No PENDING requests found!");
    }

    for (const request of pendingRequests) {
      const equipment = await Equipment.findById(request.equipment_id);

      if (equipment) {
        request.equipment_info = {
          name: equipment.name,
          serial_number: equipment.serial_number,
        };
      }
    }

    const response = pendingRequests.map(request => ({
      ...request._doc,
      equipment_info: request.equipment_info,
    }));

    res.status(200).json(response);

  } catch (error) {
    next(error); // Forwarding error to errorHandler (middleware)
  }
});

/**
 * @desc Request equipment assignment
 * @route POST /api/user/equipment/request
 * @access private
 */
const assignEquipment = asyncHandler(async (req, res) => {
  const { equipment_id, input_quantity } = req.body;

  // Find equipment by ID
  const equipment = await Equipment.findById(equipment_id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  // Assign equipment - Validation schema
  const assignEquipmentSchema = Joi.object({
    equipment_id: Joi.string().required(), // zbog testiranja staviti equipment_id 
    input_quantity: Joi.number().integer().min(1).required()
  });

  // Display validation messages using Joi schema
  const { error } = assignEquipmentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
  }

  const userId = req.user.user._id;

  // Check if the user has already submitted a request for this equipment
  const existingRequest = await Request.findOne({ user_id: userId, equipment_id, request_status: UserEquipmentStatus.PENDING });
  if (existingRequest) {
    res.status(400);
    throw new Error("You have already sent a request for this equipment!");
  }

  // Check equipment availability
  if (equipment.quantity === 0) {
    res.status(400);
    throw new Error("The current equipment count is '0'!");
  }

  // Verify the available quantity of equipment for assignment
  if (input_quantity > equipment.quantity) {
    res.status(400);
    throw new Error("Not enough equipment available for assignment!");
  }

  // If equipment is available, set the request to "pending" -> create a new equipment assignment request
  const newRequest = new Request({
    user_id: req.user.user._id,
    equipment_id: equipment._id,
    quantity: input_quantity,
    request_status: UserEquipmentStatus.PENDING,
    assign_date: new Date(),
  });

  try {
    // Save the new request to the database
    await newRequest.save();

    /** OBAVIJESTI **/
    // Pošalji obavijest korisniku o uspješnom slanju zahtjeva
    // Logika slanja obavijesti korisniku, na primjer putem emaila ili push notifikacija

    // Pošalji obavijest administratoru o novom zahtjevu
    // Logika slanja obavijesti administratoru, na primjer putem emaila ili push notifikacija
    /** OBAVIJESTI **/

    // Send response with appropriate message
    return res.status(200).json({ message: "Equipment assignment request sent successfully.", request: newRequest });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send equipment assignment request.", error: error.message });
  }
});

/**
 * @desc Cancel or Update New equipment request
 * @route PATCH /api/user/equipment/request/:id
 * @access private
 */
const cancelEquipmentRequest = asyncHandler(async (req, res) => {
  const { new_quantity, return_status_request } = req.body;
  const requestId = req.params.id;
  const request = await Request.findById(requestId);

  if (!request) {
    res.status(404);
    throw new Error("Request not found!");
  }

  // New quantity request - validation schema
  const updateQuantitySchema = Joi.object({
    new_quantity: Joi.number().integer().min(1).optional(),
    return_status_request: Joi.string().valid("canceled").optional()
  });

  // Display validation messages using Joi schema
  const { error } = updateQuantitySchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
  }

  // Authorization check
  if (request.user_id.toString() !== req.user.user._id) {
    res.status(403);
    throw new Error("User doesn't have permission to cancel this request!");
  }

  // Check if the request is in "pending" status
  if (request.request_status !== UserEquipmentStatus.PENDING) {
    res.status(400);
    throw new Error("Request is not pending!");
  }

  // Find equipment by ID
  const equipment = await Equipment.findById(request.equipment_id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  const equipmentDetails = {
    name: equipment.name,
    serial_number: equipment.serial_number
  };

  // Cancel the request
  if (return_status_request === "canceled") {
    // Cancel the request
    // const unassigned_quantity = request.quantity;

    // const newHistory = new EquipmentHistory({
    //   user_id: request.user_id,
    //   equipment_id: request.equipment_id,
    //   unassigned_quantity: unassigned_quantity,
    //   unassign_date: new Date(),
    //   return_status_request: UserEquipmentStatus.CANCELED,
    // });
    // // Save changes to database
    // await newHistory.save();

    // Delete the request from the Request collection
    await Request.findByIdAndDelete(requestId);

    res.status(200).json({
      message: "Equipment request CANCELED and DELETED successfully.",
      equipment: equipmentDetails,
    });
  } else {
    // Check the available amount of equipment in stock
    if (new_quantity > equipment.quantity) {
      return res.status(400).json({ message: "Not enough equipment available for assignment!" });
    }

    // Update sent request
    request.quantity = new_quantity;
    request.assign_date = new Date();
    request.request_status = UserEquipmentStatus.PENDING;
    request.return_status_request = UserEquipmentStatus.INACTIVE;

    // Save changes to database
    const updatedUserEquipment = await request.save();
    res.status(200).json({
      message: "NEW ASSIGNMENT request has been sent!",
      updatedUserEquipment,
      equipment: equipmentDetails,
    });
  }
});

/*** VIDJETI kako za live obavijesti, kada user klikne na dugme da se salje obavijest da određenu opremu želi razdužiti ***/
/*** ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓  ***/

/**
 * @desc Request notification to unassign equipment
 * @route POST /api/user/unassignEquipment
 * @access private
 */
const unassignEquipmentRequest = asyncHandler(async (req, res) => {
  const { equipment_id, unassign_quantity } = req.body;

  // Unassign equipment - Validation schema
  const unassignEquipmentSchema = Joi.object({
    equipment_id: Joi.string().required(),
    unassign_quantity: Joi.number().integer().min(1).required(),
  });

  // Display validation messages using Joi schema
  const { error } = unassignEquipmentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
  }

  // Find equipment by ID
  const equipment = await Equipment.findById(equipment_id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  // Find request_status === "active" for USER
  const userEquipment = await Request.findOne({
    user_id: req.user.user._id,
    equipment_id: equipment_id,
    request_status: UserEquipmentStatus.ACTIVE,
  });

  if (!userEquipment) {
    res.status(404);
    throw new Error("Assigned equipment not found!");
  }

  // Check the validity of the quantity
  if (unassign_quantity > userEquipment.quantity) {
    res.status(400);
    throw new Error("Please enter a valid quantity for unassigning equipment!");
  }

  // Kreiraj obavijest za admina
  const notification = {
    userId: userObjectId,
    equipmentId: equipmentObjectId,
    equipmentName: equipment.name,
    requestedUnassignQuantity: unassign_quantity,
    requestDate: new Date(),
  };

  // Emitiranje obavijesti adminima (Socket.IO primjer)
  req.io.emit('unassignRequest', notification);

  // Request to unassign equipment sent to admin
  res.status(200).json({ message: `Request to unassign ${unassign_quantity} of ${equipment.name} sent to admin.` });
});

/**
 * @desc Get history for RETURNED equipment
 * @route GET /api/user/equipmentHistory
 * @access private
 */
const getEquipmentHistory = asyncHandler(async (req, res) => {
  // Execute a query to the database to retrieve the returned equipment
  const historyData = await EquipmentHistory.find({
    user_id: req.user.user._id,
    return_status_request: UserEquipmentStatus.RETURNED
  }).sort({ unassign_date: -1 });

  // Check if equipment history is found for the current user
  if (!historyData || historyData.length === 0) {
    res.status(404);
    throw new Error("Equipment history not found for the current user!");
  }

  // Iterate through all requests and get equipment information
  for (const history of historyData) {
    const equipment = await Equipment.findById(history.equipment_id);
    if (equipment) {
      history.equipment_info = {
        name: equipment.name,
        serial_number: equipment.serial_number,
      };
    }
  }

  const response = historyData.map(history => {
    return {
      ...history._doc,
      equipment_info: history.equipment_info
    };
  });

  res.status(200).json(response);
});

/**
 * @desc Delete request from History
 * @route DELETE /api/user/equipmentHistory/:id
 * @access private
 */
const deleteRequest = asyncHandler(async (req, res) => {
  const history = await EquipmentHistory.findById(req.params.id);
  try {
    if (!history) {
      res.status(404);
      throw new Error("Request not found!");
    }

    // Check if the status of the request is "returned"
    if (history.return_status_request === UserEquipmentStatus.RETURNED) {
      // Delete request from database
      await EquipmentHistory.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Request deleted successfully." });
    } else {
      res.status(400);
      throw new Error("Request status is not 'RETURNED'!");
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  getActiveRequests,
  getPendingRequests,
  assignEquipment,
  unassignEquipmentRequest,
  cancelEquipmentRequest,
  getEquipmentHistory,
  deleteRequest,
};
