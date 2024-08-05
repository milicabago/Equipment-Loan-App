const asyncHandler = require("express-async-handler");
const Joi = require("joi");
/** Models **/
const User = require("../models/userModel");
const Equipment = require("../models/equipmentModel");
const Request = require("../models/userEquipmentModel");
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

        //Find equipment information based on equipment_id
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
    // Pronađi sve zahtjeve koji su u statusu "pending"
    const requests = await Request.find({ request_status: UserEquipmentStatus.PENDING }).sort({ assign_date: 1 });

    // Provjeri jesu li pronađeni zahtjevi
    if (!requests || requests.length === 0) {
        res.status(404);
        throw new Error("There are no pending requests!");
    }

    // Iteriraj kroz sve zahtjeve i dohvati informacije o korisnicima
    for (const request of requests) {
        const user = await User.findById(request.user_id);
        if (user) {
            request.user_info = {
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username
            };
        }

        // Pronađi informacije o opremi na temelju equipment_id
        const equipment = await Equipment.findById(request.equipment_id);
        // Ako je oprema pronađena, dodaj informacije o opremi u zahtjev
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

    // Dodaj user_info na kraj svakog zahtjeva
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
 * @desc Deactivate request for assigned equipment
 * @route PATCH /api/admin/:id
 * @access private
 */
const deactivateRequest = asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);
    const equipmentQuantity = await Equipment.findById(request.equipment_id);

    // Check if the request is found
    if (!request) {
        res.status(404).json({ message: "Request not found!" });
        return;
    }

    // Validation schema
    const deactivateRequestSchema = Joi.object({
        unassigned_quantity: Joi.number().integer().min(1).required()
    });

    // Display validation messages using Joi schema
    const { error } = deactivateRequestSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        res.status(400);
        throw new Error(errorMessages.join(', '));
    }

    // Ako admin unese vise od onoga nego sto je zaduzeno
    if (req.body.unassigned_quantity > request.quantity) {
        res.status(400);
        throw new Error("Invalid quantity for unassigning equipment!");
    }

    // Smanji ukupnu količinu opreme u zahtjevu za količinu koja se razdužuje
    request.unassigned_quantity += req.body.unassigned_quantity;
    request.quantity -= req.body.unassigned_quantity;

    // Povećaj količinu dostupne opreme u bazi (nakon razduživanja korisnika)
    if (equipmentQuantity) {
        equipmentQuantity.quantity += req.body.unassigned_quantity;
        await equipmentQuantity.save();
    }

    // Kada razdužimo korisnika opreme
    if (request.quantity === 0) {
        request.return_status_request = UserEquipmentStatus.RETURNED;
        request.request_status = UserEquipmentStatus.INACTIVE;
        request.unassign_date = new Date();

        res.status(200).json({ message: "User has returned all equipment.", request });
    }

    // Spremi promjene
    const changeRequestStatus = await request.save();

    // Vrati ažurirani zahtjev
    res.status(200).json({ message: "Request status updated to returned.", changeRequestStatus });
});

/**
 * @desc Update request status (Accept or Deny)
 * @route PATCH /api/admin/requests/:id
 * @access private
 */
const acceptOrDeniedRequest = asyncHandler(async (req, res) => {
    // Pronađi zahtjev po ID-u
    const request = await Request.findById(req.params.id);

    // Provjeri postoji li zahtjev s tim ID-om
    if (!request) {
        res.status(404);
        throw new Error("Request not found!");
    }

    const equipmentQuantity = await Equipment.findById(request.equipment_id);

    // Ažuriraj status zahtjeva na temelju statusa poslanog u tijelu zahtjeva
    if (req.body.request_status === 'active') {
        request.request_status = UserEquipmentStatus.ACTIVE;
        request.assign_date = new Date();

        // Smanji količinu dostupne opreme u bazi (nakon aktiviranja zahtjeva)
        if (equipmentQuantity) {
            equipmentQuantity.quantity -= request.quantity;
            if (equipmentQuantity.quantity < 0) {
                res.status(400);
                throw new Error("Not enough equipment available for assignment!");
            }
            await equipmentQuantity.save();
        }

        await request.save();

        res.status(200).json({ message: "Request activated successfully.", request_status: request.request_status });
    } else if (req.body.request_status === 'denied') {
        if (request.request_status === UserEquipmentStatus.DENIED) {
            return res.status(400).json({ message: "Request is already denied!" });
        }

        request.request_status = UserEquipmentStatus.DENIED;
        await request.save();

        res.status(200).json({ message: "Request denied.", request_status: request.request_status });
    } else {
        res.status(400);
        throw new Error("Invalid status!");
    }
});

module.exports = { getAllActiveRequests, getAllPendingRequests, deactivateRequest, acceptOrDeniedRequest };