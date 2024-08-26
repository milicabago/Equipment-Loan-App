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
 * @desc Request equipment assignment + NOTIFICATION
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
    equipment_id: Joi.string().required(),
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
    unassign_date: null,
  });

  try {
    // Save the new request to the database
    await newRequest.save();

    const loginUser = req.user.user;
    // Fetch all ADMIN users
    const admins = await User.find({ role: 'admin' });

    // Create notification message
    const notificationMessage = `${loginUser.first_name} ${loginUser.last_name} requested the assignment -\n${input_quantity} of ${equipment.name}.`;

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
 * @desc Cancel or Update New equipment request + NOTIFICATION
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

  const loginUser = req.user.user;
  // Fetch all ADMIN users
  const admins = await User.find({ role: 'admin' });

  // Cancel the request
  if (return_status_request === "canceled") {
    // Delete the request from the Request collection
    await Request.findByIdAndDelete(requestId);

    // Create notification message
    const notificationMessage = `${loginUser.first_name} ${loginUser.last_name} canceled the request for ${equipment.name}.`;

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


    // Create notification message
    const notificationMessage = `${loginUser.first_name} ${loginUser.last_name} updated the request for ${equipment.name} to ${new_quantity}.`;

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

    res.status(200).json({
      message: "NEW ASSIGNMENT request has been sent!",
      updatedUserEquipment,
      equipment: equipmentDetails,
    });
  }
});

/**
 * @desc Request notification to unassign equipment + NOTIFICATION
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
    throw new Error("Please enter a valid quantity\nfor unassigning equipment!");
  }

  const existingRequest = await Request.findOne({ user_id: req.user.user._id, equipment_id, return_status_request: UserEquipmentStatus.PENDING });
  if (existingRequest) {
    res.status(400);
    throw new Error("You have already sent a unassign request for this equipment!");
  }

  // Update return_status_request to PENDING and set the unassign_quantity
  userEquipment.return_status_request = UserEquipmentStatus.PENDING;
  userEquipment.unassign_quantity = unassign_quantity;
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
 * @route GET /api/user/equipmentHistory
 * @access private
 */
const getEquipmentHistory = asyncHandler(async (req, res) => {
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
 * @desc Delete request from History
 * @route DELETE /api/user/equipmentHistory/:id
 * @access private
 */
const deleteRequest = asyncHandler(async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc Delete selected requests from history 
 * @route GET /api/user/equipmentHistory/deleteHistory
 * @access private
 */
const deleteSelectHistory = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error("No selected history records to delete!");
  }

  // Check if all IDs exist in the database
  const historyItems = await UserHistory.find({ _id: { $in: ids } });

  // Find IDs that were not found in the database
  const foundIds = historyItems.map(item => item._id.toString());
  const notFoundIds = ids.filter(id => !foundIds.includes(id));

  if (notFoundIds.length > 0) {
    res.status(404);
    throw new Error(`Some history records were not found: ${notFoundIds.join(', ')}`);
  }

  try {
    // Obrisati sve stavke koje odgovaraju ID-evima
    await UserHistory.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: "Selected records have been successfully DELETED." });
  } catch (error) {
    next(error);
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
  deleteSelectHistory
};
