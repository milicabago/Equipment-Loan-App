const asyncHandler = require("express-async-handler");
const Joi = require("joi");
/** Models **/
const Equipment = require("../models/equipmentModel");
const UserEquipment = require("../models/userEquipmentModel");
const UserHistory = require("../models/userHistoryModel")
const AdminHistory = require("../models/adminHistoryModel");
/** Constants **/
const { UserEquipmentStatus } = require("../constants");

/**
 * @desc Get all equipments
 * @route GET /api/admin/equipment
 * @route GET /api/user/equipment
 * @access private
 */
const getAllEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.find().sort({ name: 1 });

  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  // Fetch all active user equipment assignments
  let assignEquipment = await UserEquipment.find({ request_status: UserEquipmentStatus.ACTIVE });

  // Aggregate the quantities for each equipment based on equipment_id
  let assignQuantity = assignEquipment.reduce((acc, item) => {
    acc[item.equipment_id] = (acc[item.equipment_id] || 0) + item.quantity;
    return acc;
  }, {});

  // Combine the aggregated data with the equipment data
  const equipmentWithAssignedQuantities = equipment.map(item => ({
    ...item.toObject(),
    assigned_quantity: assignQuantity[item._id] || 0
  }));

  res.status(200).json(equipmentWithAssignedQuantities);
});

/**
 * @desc Get equipment
 * @route GET /api/admin/equipment/:id
 * @route GET /api/user/equipment/:id
 * @access private
 */
const getEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }
  res.status(200).json(equipment);
});

/**
 * @desc Add New equipment
 * @route POST /api/admin/addEquipment
 * @access private
 */
const addEquipment = asyncHandler(async (req, res) => {

  const { name, full_name, serial_number, condition, quantity, description } = req.body;

  console.log("Condition: " + req.body.condition);


  // Equipment validation schema
  const addEquipmentSchema = Joi.object({
    name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"name\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    full_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"full_name\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    serial_number: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"serial_number\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    condition: Joi.boolean().required(),
    quantity: Joi.number().integer().min(1).required(),
    description: Joi.string().allow("").optional(),
  });

  // Display validation messages using Joi schema
  const { error } = addEquipmentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
  }

  // Check if equipment exists in the database by unique serial number
  const existingEquipment = await Equipment.findOne({ serial_number: req.body.serial_number });
  if (existingEquipment) {
    res.status(400);
    throw new Error("Equipment with serial number already exists!");
  }


  const newEquipment = new Equipment({
    name,
    full_name,
    serial_number,
    quantity,
    condition,
    description: description,
  });

  await newEquipment.save();

  res.status(201).json({ message: "Added equipment.", newEquipment });
});

/**
 * @desc Update equipment
 * @route PUT /api/admin/equipment/:id
 * @access private
 */
const updateEquipment = asyncHandler(async (req, res) => {

  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  // Equipment validation schema
  const updateEquipmentSchema = Joi.object({
    name: Joi.string().optional().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"name\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    full_name: Joi.string().optional().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"full_name\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    serial_number: Joi.string().optional().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"serial_number\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    condition: Joi.boolean().optional(),
    invalid_quantity: Joi.number().integer().min(0).optional(),
    quantity: Joi.number().integer().min(0).optional(),
    description: Joi.string().allow("").optional().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"description\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
  });

  // Display validation messages using Joi schema
  const { error } = updateEquipmentSchema.validate(req.body, { abortEarly: false }); // Add option abortEarly: false -> to show all errors
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
  }

  // Check if there is equipment with the same serial number in the database, except current equipment updating
  const existingEquipment = await Equipment.findOne({ serial_number: req.body.serial_number, _id: { $ne: req.params.id } });
  if (existingEquipment) {
    res.status(400);
    throw new Error("Equipment with serial number already exists!");
  }

  // Check if invalid_quantity is present in the request
  if (req.body.invalid_quantity !== undefined) {
    // Ensure no other fields are being updated
    const otherFields = ['name', 'full_name', 'serial_number', 'condition', 'quantity', 'description'];
    const isOtherFieldPresent = otherFields.some(field => req.body[field] !== undefined);

    if (isOtherFieldPresent) {
      res.status(400);
      throw new Error("Cannot update equipment info when entered invalid quantity!");
    }

    // Check and update invalid_quantity
    const invalidQuantity = req.body.invalid_quantity;
    if (invalidQuantity > equipment.quantity) {
      res.status(400);
      throw new Error("Wrong quantity entered for non-functional equipment!");
    }

    if (invalidQuantity === 0) {
      equipment.invalid_quantity = 0;
    } else {
      equipment.quantity -= invalidQuantity;
      equipment.invalid_quantity += invalidQuantity;
    }

    if (equipment.quantity === 0) {
      equipment.condition = false;
    }

    await equipment.save();

  } else {
    // Update other fields
    const updateFields = ['name', 'full_name', 'serial_number', 'condition', 'quantity', 'description'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        equipment[field] = req.body[field];
      }
    });

    await equipment.save();
  }

  const updatedEquipment = await equipment.save();

  res.status(200).json({ message: "Updated equipment.", updatedEquipment });
});

/**
 * @desc Delete equipment
 * @route DELETE /api/admin/equipment/:id
 * @access private
 */
const deleteEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  const userEquipment = await UserEquipment.find({ equipment_id: equipment._id });

  // Check user's equipment assignments
  if (userEquipment && userEquipment.some(eq => eq.request_status === UserEquipmentStatus.ACTIVE)) {
    res.status(400);
    throw new Error("Equipment is assigned to the user. Please unassign equipment before deleting!");
  }

  if (userEquipment && userEquipment.some(eq => eq.request_status === UserEquipmentStatus.PENDING)) {
    res.status(400);
    throw new Error("Equipment request has been sent. Please resolve request before deleting the equipment!");
  }

  // Delete equipment from history for the selected equipment
  await UserHistory.deleteMany({ equipment_id: equipment._id });
  await AdminHistory.deleteMany({ equipment_id: equipment._id });

  const deleteEquipment = await Equipment.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Deleted equipment!", deleteEquipment });
});

module.exports = {
  getAllEquipment,
  getEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
};
