const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const Equipment = require("../models/equipmentModel");

// Prilikom update provjera svih polja
// Definiranje sheme za validaciju objekta opreme
const equipmentSchema = Joi.object({
  name: Joi.string().required(),
  full_name: Joi.string().required(),
  serial_number: Joi.string().required(),
  condition: Joi.boolean().required(),
  quantity: Joi.number().valid(1).required(),
  description: Joi.string().allow("").optional(),
});

//@desc Get all equipments
//@route GET /api/admin/equipment *//* @route GET /api/user/equipment
//@access private
const getAllEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.find();

  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  res.status(200).json(equipment);
});

//@desc Get equipment
//@route GET /api/admin/equipment/:id *//* @route GET /api/user/equipment/:id
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
  console.log("The request body is:\n", req.body);
  const { name, full_name, serial_number, condition, quantity, description } = req.body;
  if (!name || !full_name || !serial_number || !condition || !quantity) {
    res.status(400);
    throw new Error("Fields for 'Name, Full name, Serial number, Condition, Quantity' are mandatory!");
  }

  // Provjeri postoji li oprema u bazi prema jedinstenom serijskom broju
  const existingEquipment = await Equipment.findOne({ serial_number });
  if (existingEquipment) {
    res.status(400);
    throw new Error("Equipment with serial number already added!");
  }

  if (quantity <= 0 || !Number.isInteger(quantity)) {
    res.status(400);
    throw new Error("Please enter a valid quantity of equipment!");
  }

  let equipmentDescription = description ? description : "";

  const equipment = await Equipment.create({
    name,
    full_name,
    serial_number,
    quantity,
    condition,
    description: equipmentDescription,
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

  // Validacija podataka za update
  const { error } = equipmentSchema.validate(req.body, { abortEarly: false }); // Dodajemo opciju abortEarly: false -> kako bi prikazali sve greške
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
