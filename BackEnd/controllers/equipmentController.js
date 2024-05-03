const asyncHandler = require("express-async-handler");
const Joi = require("joi");
/** Models **/
const Equipment = require("../models/equipmentModel");
const UserEquipment = require("../models/userEquipmentModel");
const { UserEquipmentStatus } = require("../constants");

//@desc Get all equipments
//@route GET /api/admin/equipment
//@route GET /api/user/equipment
//@access private
const getAllEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.find().sort({ name: 1 });

  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  res.status(200).json(equipment);
});

//@desc Get equipment
//@route GET /api/admin/equipment/:id 
//@route GET /api/user/equipment/:id
//@access private
const getEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }
  res.status(200).json(equipment);
});

//@desc Add New equipment
//@route POST /api/admin/addEquipment
//@access private
const addEquipment = asyncHandler(async (req, res) => {

  const { name, full_name, serial_number, condition, quantity, description } = req.body;

  // Equipment validation
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

  // Validacija podataka za dodavanje opreme
  const { error } = addEquipmentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
  }

  // Provjera postoji li oprema u bazi prema jedinstenom serijskom broju
  const existingEquipment = await Equipment.findOne({ serial_number: req.body.serial_number });
  if (existingEquipment) {
    res.status(400);
    throw new Error("Equipment with serial number already exists!");
  }


  const equipment = await Equipment.create({
    name,
    full_name,
    serial_number,
    quantity,
    condition,
    description: description,
  });

  res.status(201).json({ message: "Added equipment.", equipment });
});

//@desc Update equipment
//@route PUT /api/admin/equipment/:id
//@access private
const updateEquipment = asyncHandler(async (req, res) => {

  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  // Equipment validation
  const updateEquipmentSchema = Joi.object({
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
    quantity: Joi.number().integer().min(0).required(),
    description: Joi.string().allow("").optional().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"description\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
  });

  // Validacija podataka za update
  const { error } = updateEquipmentSchema.validate(req.body, { abortEarly: false }); // Dodajemo opciju abortEarly: false -> kako bi prikazali sve greške
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
  }

  // Provjeri postoji li oprema s istim serijskim brojem u bazi osim trenutne opreme koju ažuriranam
  const existingEquipment = await Equipment.findOne({ serial_number: req.body.serial_number, _id: { $ne: req.params.id } });
  if (existingEquipment) {
    res.status(400);
    throw new Error("Equipment with serial number already exists!");
  }

  const updatedEquipment = await Equipment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res.status(200).json({ message: "Updated equipment.", updatedEquipment });
});

//@desc Delete equipment
//@route DELETE /api/admin/equipment/:id
//@access private
const deleteEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  const userEquipment = await UserEquipment.find({ equipment_id: equipment._id });

  // Provjera zaduženja korisnika za opremu
  if (userEquipment && userEquipment.some(eq => eq.request_status === UserEquipmentStatus.ACTIVE)) {
    res.status(400);
    throw new Error("Equipment is assigned to the user. Please unassign equipment before deleting!");
  }

  if (userEquipment && userEquipment.some(eq => eq.request_status === UserEquipmentStatus.PENDING)) {
    res.status(400);
    throw new Error("Equipment request has been sent. Please resolve request before deleting the equipment!");
  }

  const deleteEquipment = await Equipment.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Deleted equipment!", deleteEquipment });
});

module.exports = {
  getAllEquipment,
  addEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
};
