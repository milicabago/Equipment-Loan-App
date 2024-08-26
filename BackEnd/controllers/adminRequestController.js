const asyncHandler = require("express-async-handler");
const Joi = require("joi");
/** Models **/
const User = require("../models/userModel");
const Equipment = require("../models/equipmentModel");
const Request = require("../models/userEquipmentModel");
const UserHistory = require("../models/userHistoryModel")
const AdminHistory = require("../models/adminHistoryModel")
const Notification = require('../models/notificationModel');
/** Constants **/
const { UserEquipmentStatus } = require("../constants");

/**** Requests managed by ADMIN ****/

/**
 * @desc Get all Active requests (Users + Equipment)
 * @route GET /api/admin/
 * @access private
 */
const getAllActiveRequests = asyncHandler(async (req, res) => {

    // Find all active requests - each user's assigned equipment
    const requests = await Request.find({ request_status: UserEquipmentStatus.ACTIVE }).sort({ assign_date: 1 });

    // Check if requests are found
    if (!requests || requests.length === 0) {
        res.status(404);
        throw new Error("No active equipment assigned!");
    }

    // Iterate through all requests and fetch user information
    for (const request of requests) {
        const user = await User.findById(request.user_id);
        if (user) {
            request.user_info = {
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username
            };
        }

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

    // Add user_info and equipment_info at the end of each request
    const response = requests.map(request => {
        return {
            ...request._doc,
            user_info: request.user_info,
            equipment_info: request.equipment_info,
        };
    });

    res.status(200).json(response);
});

/**
 * @desc Get all Pending requests (Users + Equipment)
 * @route GET /api/admin/requests
 * @access private
 */
const getAllPendingRequests = asyncHandler(async (req, res) => {
    // Find all requests that are in status "pending"
    const requests = await Request.find({ request_status: UserEquipmentStatus.PENDING }).sort({ assign_date: 1 });

    // Check if requests are found
    if (!requests || requests.length === 0) {
        res.status(404);
        throw new Error("There are no pending requests!");
    }

    // Iterate through all requests and fetch user and equipment information
    for (const request of requests) {
        const user = await User.findById(request.user_id);
        if (user) {
            request.user_info = {
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username
            };
        }

        // Find equipment information based on equipment_id
        const equipment = await Equipment.findById(request.equipment_id);
        // If equipment is found, add equipment information to the request
        if (equipment) {
            request.equipment_info = {
                name: equipment.name,
                full_name: equipment.full_name,
                serial_number: equipment.serial_number,
                quantity: equipment.quantity,
                request_status: equipment.request_status
            };
        }
    }

    // Add user_info and equipment_info at the end of each request
    const response = requests.map(request => {
        return {
            ...request._doc,
            user_info: request.user_info,
            equipment_info: request.equipment_info,
        };
    });

    res.status(200).json(response);
});

/**
 * @desc Deactivate request for assigned equipment (returned) + NOTIFICATION
 * @route PATCH /api/admin/:id
 * @access private
 */
const deactivateRequest = asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);
    const unassign_quantity = req.body.unassign_quantity;

    if (!request) {
        res.status(404);
        throw new Error("Request not found!");
    }

    const deactivateRequestSchema = Joi.object({
        unassign_quantity: Joi.number().integer().min(1).required()
    });

    const { error } = deactivateRequestSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        res.status(400);
        throw new Error(errorMessages.join(', '));
    }

    const equipment = await Equipment.findById(request.equipment_id);

    if (!equipment) {
        res.status(404);
        throw new Error("Equipment not found!");
    }

    if (unassign_quantity > request.quantity) {
        res.status(400);
        throw new Error("Invalid quantity for unassigning equipment!");
    }

    const newUserHistory = new UserHistory({
        user_id: request.user_id,
        equipment_id: request.equipment_id,
        unassigned_quantity: unassign_quantity,
        assign_date: request.assign_date,
        unassign_date: new Date(),
        return_status_request: UserEquipmentStatus.RETURNED,
    });
    await newUserHistory.save();

    const newAdminHistory = new AdminHistory({
        user_id: request.user_id,
        equipment_id: request.equipment_id,
        unassigned_quantity: unassign_quantity,
        assign_date: request.assign_date,
        unassign_date: new Date(),
        return_status_request: UserEquipmentStatus.RETURNED,
    });
    await newAdminHistory.save();

    request.quantity -= unassign_quantity;

    // Notification messages
    const notificationMessage = request.quantity === 0
        ? `Equipment ALL RETURNED: ${unassign_quantity} of ${equipment.name}`
        : `Equipment RETURNED: ${unassign_quantity} of ${equipment.name}`;

    // Create and save the notification in the database
    const notification = new Notification({
        user_id: request.user_id,
        sender: "admin",
        message: notificationMessage,
        createdAt: new Date(),
    });
    await notification.save()

    if (request.quantity === 0) {
        request.request_status = UserEquipmentStatus.INACTIVE;
        request.return_status_request = UserEquipmentStatus.RETURNED;

        await Request.deleteOne({ _id: request._id });

        equipment.quantity += unassign_quantity;
        await equipment.save();

        // Emit notification for returning all equipment to the specific USER
        if (req.io) {
            req.io.to(request.user_id.toString()).emit('equipmentReturned', notification);
        } else {
            console.error("Socket.IO is not available!");
        }

        return res.status(200).json({
            message: `User has returned ALL EQUIPMENT. Request deleted.`,
        });
    }

    equipment.quantity += unassign_quantity;
    await equipment.save();

    const updatedRequest = await request.save();

    // Emit notification for partial return of equipment to the specific USER
    if (req.io) {
        req.io.to(request.user_id.toString()).emit('equipmentReturned', notification);
    } else {
        console.error("Socket.IO is not available!");
    }

    res.status(200).json({
        message: `Request status updated to RETURNED (${unassign_quantity} of ${equipment.name}).`,
        request: updatedRequest
    });
});

/**
 * @desc Update request status (Accept or Deny) + NOTIFICATION
 * @route PATCH /api/admin/requests/:id
 * @access private
 */
const acceptOrDenyRequest = asyncHandler(async (req, res) => {
    const { request_status, return_status_request } = req.body;
    const requestId = req.params.id;

    // Find the request by ID
    const request = await Request.findById(req.params.id);

    // Check if the request is found
    if (!request) {
        res.status(404);
        throw new Error("Request not found!");
    }

    // Check if the equipment is found
    const equipment = await Equipment.findById(request.equipment_id);
    if (!equipment) {
        res.status(404);
        throw new Error("Equipment not found!");
    }

    const equipmentDetails = {
        name: equipment.name,
        serial_number: equipment.serial_number,
    };

    // Notification message
    let notificationMessage = "";

    // If request status is "active", assign equipment to user
    // If request status is "denied", delete request
    if (request_status === 'active') {
        request.request_status = UserEquipmentStatus.ACTIVE;
        request.assign_date = new Date();

        equipment.quantity -= request.quantity;
        await equipment.save();
        await request.save();

        // Notification message
        notificationMessage = `Equipment request ACTIVE:\n${request.quantity} of ${equipment.name}`;

        res.status(200).json({
            message: "Request activated successfully.",
            equipment: equipmentDetails,
        });
    } else if (request_status === 'denied') {
        if (request.request_status === UserEquipmentStatus.DENIED) {
            return res.status(400).json({ message: "Request is already denied!" });
        }

        // Delete the request from the Request collection
        await Request.findByIdAndDelete(requestId);

        notificationMessage = `Equipment request DENIED:\n${request.quantity} of ${equipment.name}`;

        res.status(200).json({
            message: "Equipment request DENIED and DELETED successfully.",
            equipment: equipmentDetails,
        });
    }
    // If return status request is "active", unassign equipment request accepted
    // If return status request is "denied", unassign equipment request denied 
    else if (return_status_request === 'active') {
        // Update the request status for unassignment
        request.quantity -= request.unassign_quantity;
        equipment.quantity += request.unassign_quantity;
        request.return_status_request = UserEquipmentStatus.INACTIVE;
        await equipment.save();

        const newUserHistory = new UserHistory({
            user_id: request.user_id,
            equipment_id: request.equipment_id,
            unassigned_quantity: request.unassign_quantity,
            assign_date: request.assign_date,
            unassign_date: new Date(),
            return_status_request: UserEquipmentStatus.RETURNED,
        });
        await newUserHistory.save();

        const newAdminHistory = new AdminHistory({
            user_id: request.user_id,
            equipment_id: request.equipment_id,
            unassigned_quantity: request.unassign_quantity,
            assign_date: request.assign_date,
            unassign_date: new Date(),
            return_status_request: UserEquipmentStatus.RETURNED,
        });
        await newAdminHistory.save();

        // When all equipment is returned
        if (request.quantity === 0) {
            request.request_status = UserEquipmentStatus.INACTIVE;
            request.return_status_request = UserEquipmentStatus.RETURNED;
            notificationMessage = `Equipment ALL RETURNED:\n${request.unassign_quantity} of ${equipment.name}`;
            await request.save();
            await Request.findByIdAndDelete(requestId);

            // Create and save the notification in the database
            const notification = new Notification({
                user_id: request.user_id,
                sender: "admin",
                message: notificationMessage,
                createdAt: new Date(),
            });
            await notification.save();

            // Emit notification to the specific USER
            if (req.io) {
                req.io.to(request.user_id.toString()).emit('equipmentAcceptOrDeny', notification);
            } else {
                console.error("Socket.IO is not available!");
            }

            res.status(200).json({
                message: "User has returned ALL EQUIPMENT. Request deleted.",
                equipment: equipmentDetails,
            });
        } else {
            notificationMessage = `Equipment RETURN processed:\n${request.unassign_quantity} of ${equipment.name}`;
            request.unassign_quantity = 0;
            request.unassign_date = null;
            await request.save();
        }

        res.status(200).json({
            message: "Equipment RETURN processed successfully.",
            equipment: equipmentDetails,
        });

    } else if (return_status_request === "denied") {
        request.return_status_request = UserEquipmentStatus.INACTIVE;

        notificationMessage = `Request to unassign equipment DENIED:\n${request.unassign_quantity} of ${equipment.name}`;
        let unassignQuantity = request.unassign_quantity;
        request.unassign_quantity = 0;
        request.unassign_date = "";
        await request.save();

        res.status(200).json({
            message: `Request to unassign equipment DENIED: ${unassignQuantity} of ${equipment.name}`,
        });
    }
    else {
        res.status(400);
        throw new Error("Invalid status!");
    }

    // Create and save the notification in the database
    const notification = new Notification({
        user_id: request.user_id,
        sender: "admin",
        message: notificationMessage,
        createdAt: new Date(),
    });
    await notification.save();

    // Emit notification to the specific USER
    if (req.io) {
        req.io.to(request.user_id.toString()).emit('equipmentAcceptOrDeny', notification);
    } else {
        console.error("Socket.IO is not available!");
    }
});

/**
 * @desc Get all history for RETURNED equipment (for all USERS)
 * @route GET /api/admin/equipmentHistory
 * @access private
 */
const getAllEquipmentHistory = asyncHandler(async (req, res) => {
    // Execute a query to the database to retrieve unassigned equipment history
    const historyData = await AdminHistory.find({}).sort({ unassign_date: -1 });

    // Check if equipment history is found
    if (!historyData || historyData.length === 0) {
        res.status(404);
        throw new Error("Equipment history not found!");
    }

    // Iterate through all requests and fetch equipment and user information
    for (const history of historyData) {
        // Fetch equipment information
        const equipment = await Equipment.findById(history.equipment_id);
        if (equipment) {
            history.equipment_info = {
                name: equipment.name,
                serial_number: equipment.serial_number,
            };
        }

        // Fetch user information
        const user = await User.findById(history.user_id);
        if (user) {
            history.user_info = {
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
            };
        }
    }

    // Format the response
    const response = historyData.map(history => {
        return {
            ...history._doc,
            equipment_info: history.equipment_info,
            user_info: history.user_info
        };
    });

    res.status(200).json(response);
});

/**
 * @desc Delete one request from History
 * @route DELETE /api/admin/equipmentHistory/:id
 * @access private
 */
const deleteRequest = asyncHandler(async (req, res) => {
    const history = await AdminHistory.findById(req.params.id);
    try {
        if (!history) {
            res.status(404);
            throw new Error("Request not found!");
        }

        // Check if the status of the request is "returned"
        if (history.return_status_request === UserEquipmentStatus.RETURNED) {
            // Delete request from database
            await AdminHistory.findByIdAndDelete(req.params.id);
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
 * @desc Delete selected requests from History 
 * @route GET /api/admin/equipmentHistory/deleteHistory
 * @access private
 */
const deleteSelectHistory = asyncHandler(async (req, res, next) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400);
        throw new Error("No selected history records to delete!");
    }

    // Check if all IDs exist in the database
    const historyItems = await AdminHistory.find({ _id: { $in: ids } });

    // Find IDs that were not found in the database
    const foundIds = historyItems.map(item => item._id.toString());
    const notFoundIds = ids.filter(id => !foundIds.includes(id));

    if (notFoundIds.length > 0) {
        res.status(404);
        throw new Error(`Some history records were not found: ${notFoundIds.join(', ')}`);
    }

    try {
        // Obrisati sve stavke koje odgovaraju ID-evima
        await AdminHistory.deleteMany({ _id: { $in: ids } });

        res.status(200).json({ message: "Selected records have been successfully DELETED." });
    } catch (error) {
        next(error);
    }
});

module.exports = {
    getAllActiveRequests,
    getAllPendingRequests,
    deactivateRequest,
    acceptOrDenyRequest,
    getAllEquipmentHistory,
    deleteRequest,
    deleteSelectHistory
};