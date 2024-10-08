const asyncHandler = require("express-async-handler");
const Joi = require("joi");
/** Models **/
const Equipment = require("../models/equipmentModel");
const Request = require("../models/userEquipmentModel");
const UserHistory = require("../models/userHistoryModel");
const Notification = require("../models/notificationModel")
const User = require("../models/userModel");
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
 * @desc Get all Pending assign requests for USER
 * @route GET /api/user/requests/assignPendingRequests
 * @access private
 */
const getAssignPendingRequests = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.user._id;

    const requests = await Request.find({
      user_id: userId,
      request_status: UserEquipmentStatus.PENDING
    }).sort({ assign_date: 1 });

    if (!requests || requests.length === 0) {
      res.status(404);
      throw new Error("No PENDING requests found!");
    }

    for (const request of requests) {
      const equipment = await Equipment.findById(request.equipment_id);

      if (equipment) {
        request.equipment_info = {
          name: equipment.name,
          serial_number: equipment.serial_number,
          quantity: equipment.quantity
        };
      }
    }

    const response = requests.map(request => ({
      ...request._doc,
      equipment_info: request.equipment_info,
    }));

    res.status(200).json(response);

  } catch (error) {
    next(error);
  }
});

/**
 * @desc Get all Pending unassign requests for USER
 * @route GET /api/user/requests/unassignPendingRequests
 * @access private
 */
const getUnassignPendingRequests = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.user._id;

    const requests = await Request.find({
      user_id: userId,
      return_status_request: UserEquipmentStatus.PENDING
    }).sort({ assign_date: 1 });

    if (!requests || requests.length === 0) {
      res.status(404);
      throw new Error("No PENDING requests found!");
    }

    for (const request of requests) {
      const equipment = await Equipment.findById(request.equipment_id);

      if (equipment) {
        request.equipment_info = {
          name: equipment.name,
          serial_number: equipment.serial_number,
          quantity: equipment.quantity
        };
      }
    }

    const response = requests.map(request => ({
      ...request._doc,
      equipment_info: request.equipment_info,
    }));

    res.status(200).json(response);

  } catch (error) {
    next(error);
  }
});

/**
 * @desc Request equipment assignment + NOTIFICATION
 * @route POST /api/user/equipment/request
 * @access private
 */
const assignEquipmentRequest = asyncHandler(async (req, res) => {
  const { equipment_id, assign_quantity } = req.body;

  // Find equipment by ID
  const equipment = await Equipment.findById(equipment_id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  // Assign equipment - Validation schema
  const assignEquipmentSchema = Joi.object({
    equipment_id: Joi.string().required(),
    assign_quantity: Joi.number().integer().min(1).required()
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
    throw new Error("You have already sent a request\nfor this equipment!");
  }

  // Check equipment availability
  if (equipment.quantity === 0) {
    res.status(400);
    throw new Error("The current equipment count is '0'!");
  }

  // Verify the available quantity of equipment for assignment
  if (assign_quantity > equipment.quantity) {
    res.status(400);
    throw new Error("Not enough equipment\navailable for assignment!");
  }

  // If equipment is available, set the request to "pending" -> create a new equipment assignment request
  const newRequest = new Request({
    user_id: req.user.user._id,
    equipment_id: equipment._id,
    quantity: assign_quantity,
    request_status: UserEquipmentStatus.PENDING,
    assign_date: new Date(),
    unassign_date: null,
  });

  try {
    // Save the new request to the database
    await newRequest.save();

    const loginUser = req.user.user;
    // Fetch all ADMIN users
    const admins = await User.find({ role: 'admin' });

    // Create notification message
    const notificationMessage = `${loginUser.first_name} ${loginUser.last_name} requested the assignment -\n${assign_quantity} of ${equipment.name}.`;

    // Save notification to the database and emit to each admin
    for (const admin of admins) {
      const notification = new Notification({
        user_id: admin._id,
        sender: "user",
        message: notificationMessage,
        createdAt: new Date(),
      });
      await notification.save();

      // Emit notification to admin
      if (req.io) {
        req.io.to(admin._id.toString()).emit('newAssignmentRequest', notification);
      } else {
        console.log("Socket.IO is not available!");
      }
    }

    // Send response with appropriate message
    return res.status(200).json({ message: "Equipment assignment request sent successfully.", request: newRequest });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send equipment assignment request.", error: error.message });
  }
});

/**
 * @desc Cancel or Update for New equipment request + NOTIFICATION
 * @route PATCH /api/user/requests/:id
 * @access private
 */
const cancelOrUpdateEquipmentRequest = asyncHandler(async (req, res) => {
  const { new_assign_quantity, new_unassign_quantity, new_invalid_quantity, cancel_assign_request, cancel_unassign_request } = req.body;
  const requestId = req.params.id;
  const request = await Request.findById(requestId);

  if (!request) {
    res.status(404);
    throw new Error("Request not found!");
  }

  // New quantity request - validation schema
  const updateQuantitySchema = Joi.object({
    new_assign_quantity: Joi.number().integer().min(1).optional(),
    new_unassign_quantity: Joi.number().integer().min(1).optional(),
    new_invalid_quantity: Joi.number().integer().min(0).optional(),
    cancel_assign_request: Joi.string().valid("canceled").optional(),
    cancel_unassign_request: Joi.string().valid("canceled").optional()
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

  const loginUser = req.user.user;
  // Fetch all ADMIN users
  const admins = await User.find({ role: 'admin' });

  let notificationMessage = '';

  // Obrada zahtjeva za dodjelu
  if (new_assign_quantity) {
    if (request.request_status !== UserEquipmentStatus.PENDING) {
      res.status(400);
      throw new Error("Request for assign equipment is not pending!");
    }
    if (new_assign_quantity > equipment.quantity) {
      res.status(400);
      throw new Error("Not enough equipment availablefor assignment!");
    }
    request.quantity = new_assign_quantity;
    request.assign_date = new Date();
    request.request_status = UserEquipmentStatus.PENDING;
    request.return_status_request = UserEquipmentStatus.INACTIVE;
    const updatedUserEquipment = await request.save();

    notificationMessage = `${loginUser.first_name} ${loginUser.last_name} updated the ASSIGN request for ${equipment.name} to ${new_assign_quantity}`;

    res.status(200).json({
      message: `Updated the ASSIGN request for ${equipment.name} to ${new_assign_quantity}`,
      updatedUserEquipment,
      equipment: equipmentDetails,
    });
  } else if (cancel_assign_request === "canceled") {
    if (request.request_status !== UserEquipmentStatus.PENDING) {
      res.status(400);
      throw new Error("Request for ASSIGN equipment is not pending!");
    }
    request.request_status = UserEquipmentStatus.CANCELED;
    request.quantity = 0;
    const updatedUserEquipment = request;
    await Request.findByIdAndDelete(requestId);

    notificationMessage = `${loginUser.first_name} ${loginUser.last_name} canceled the ASSIGN request for ${equipment.name}`;

    res.status(200).json({
      message: `Canceled the ASSIGN request for ${equipment.name}`,
      updatedUserEquipment,
      equipment: equipmentDetails,
    });
  } else if (new_unassign_quantity || new_invalid_quantity) {
    if (request.return_status_request !== UserEquipmentStatus.PENDING) {
      res.status(400);
      throw new Error("Request for UNASSIGN equipment is not pending!");
    }
    if (new_unassign_quantity > request.quantity) {
      res.status(400);
      throw new Error("There is not that much equipment assigned!");
    }

    if (new_invalid_quantity > new_unassign_quantity) {
      res.status(400);
      throw new Error("Invalid quantity cannot be greater\nthan unassign quantity.");
    }

    request.unassign_quantity = new_unassign_quantity;
    request.invalid_quantity = new_invalid_quantity;
    request.unassign_date = new Date();
    request.request_status = UserEquipmentStatus.ACTIVE;
    request.return_status_request = UserEquipmentStatus.PENDING;
    const updatedUserEquipment = await request.save();

    notificationMessage = `${loginUser.first_name} ${loginUser.last_name} updated the UNASSIGN request for ${equipment.name} to ${new_unassign_quantity}`;

    res.status(200).json({
      message: `Updated the UNASSIGN request for ${equipment.name} to ${new_unassign_quantity}`,
      updatedUserEquipment,
      equipment: equipmentDetails,
    });
  } else if (cancel_unassign_request === "canceled") {
    if (request.return_status_request !== UserEquipmentStatus.PENDING) {
      res.status(400);
      throw new Error("Request for unassign equipment is not pending!");
    }
    request.return_status_request = UserEquipmentStatus.INACTIVE;
    request.unassign_date = null;
    request.invalid_quantity = 0;
    request.unassign_quantity = 0;
    const updatedUserEquipment = await request.save();

    notificationMessage = `${loginUser.first_name} ${loginUser.last_name} canceled the UNASSIGN request for ${equipment.name}`;

    res.status(200).json({
      message: `Canceled the UNASSIGN request for ${equipment.name}`,
      updatedUserEquipment,
      equipment: equipmentDetails,
    });
  } else {
    res.status(400);
    throw new Error("Invalid status!");
  }

  // Save notification to the database and emit to each admin
  for (const admin of admins) {
    const notification = new Notification({
      user_id: admin._id,
      sender: "user",
      message: notificationMessage,
      createdAt: new Date(),
    });
    await notification.save();

    // Emit notification to admin
    if (req.io) {
      req.io.to(admin._id.toString()).emit('cancelOrUpdateRequest', notification);
    } else {
      console.log("Socket.IO is not available!");
    }
  }
});

/**
 * @desc Request notification to unassign equipment + NOTIFICATION
 * @route POST /api/user/unassignEquipment
 * @access private
 */
const unassignEquipmentRequest = asyncHandler(async (req, res) => {
  const { equipment_id, unassign_quantity, invalid_quantity } = req.body;

  // Unassign equipment - Validation schema
  const unassignEquipmentSchema = Joi.object({
    equipment_id: Joi.string().required(),
    unassign_quantity: Joi.number().integer().min(1).required(),
    invalid_quantity: Joi.number().integer().min(0).optional(),
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
    throw new Error("Please enter a valid quantity\nfor unassigning equipment!");
  }

  // Check if invalid_quantity is greater than unassign_quantity
  if (invalid_quantity > unassign_quantity) {
    res.status(400);
    throw new Error("Invalid quantity cannot be greater\nthan unassign quantity.");
  }

  const existingRequest = await Request.findOne({ user_id: req.user.user._id, equipment_id, return_status_request: UserEquipmentStatus.PENDING });
  if (existingRequest) {
    res.status(400);
    throw new Error("You have already sent a unassign request for this equipment!");
  }

  // Update return_status_request to PENDING and set the unassign_quantity
  userEquipment.return_status_request = UserEquipmentStatus.PENDING;
  userEquipment.unassign_quantity = unassign_quantity;
  userEquipment.invalid_quantity = invalid_quantity;
  userEquipment.unassign_date = new Date();
  await userEquipment.save();

  const loginUser = req.user.user;

  // Create notification message
  const notificationMessage = `${loginUser.first_name} ${loginUser.last_name} requested to unassign.\n${unassign_quantity} of ${equipment.name}`;

  // Fetch all ADMIN users
  const admins = await User.find({ role: 'admin' });

  // Save notification to the database and emit to each admin
  for (const admin of admins) {
    const notification = new Notification({
      user_id: admin._id,
      sender: "user",
      message: notificationMessage,
      createdAt: new Date(),
    });
    await notification.save();

    // Emit notification to admin
    if (req.io) {
      req.io.to(admin._id.toString()).emit('unassignRequest', notification);
    } else {
      console.log("Socket.IO is not available!");
    }
  }

  const loginUserName = `${loginUser.first_name} ${loginUser.last_name}`;

  // Request to unassign equipment sent to admin
  res.status(200).json({ user: loginUserName, message: `Request to unassign ${unassign_quantity} of ${equipment.name} sent to admin.` });
});

/**
 * @desc Get history for RETURNED equipment
 * @route GET /api/user/history
 * @access private
 */
const getHistory = asyncHandler(async (req, res) => {
  // Execute a query to the database to retrieve the returned equipment
  const historyData = await UserHistory.find({
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
 * @desc Delete one request from History
 * @route DELETE /api/user/history/:id
 * @access private
 */
const deleteHistoryItem = asyncHandler(async (req, res, next) => {
  const history = await UserHistory.findById(req.params.id);
  try {
    if (!history) {
      res.status(404);
      throw new Error("Request not found!");
    }

    // Check if the status of the request is "returned"
    if (history.return_status_request === UserEquipmentStatus.RETURNED) {
      // Delete request from database
      await UserHistory.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Request deleted successfully." });
    } else {
      res.status(400);
      throw new Error("Request status is not 'RETURNED'!");
    }

  } catch (error) {
    next(error);
  }
});

/**
 * @desc Delete all requests from history 
 * @route DELETE /api/user/history/deleteAllHistory
 * @access private
 */
const deleteAllHistory = asyncHandler(async (req, res, next) => {
  const loginUserId = req.user.user._id;
  try {
    // Delete all history items for the current user
    await UserHistory.deleteMany({ user_id: loginUserId });
    res.status(200).json({ message: "All history items have been successfully DELETED." });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  getActiveRequests,
  getAssignPendingRequests,
  getUnassignPendingRequests,
  assignEquipmentRequest,
  unassignEquipmentRequest,
  cancelOrUpdateEquipmentRequest,
  getHistory,
  deleteHistoryItem,
  deleteAllHistory
};
