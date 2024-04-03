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
  description: Joi.string().allow("").optional(),
});

//@desc Get all equipments
//@route GET /api/equipment
//@access public
const getAllEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.find({});
  res.status(200).json(equipment);
});

//@desc Create New equipment
//@route POST /api/equipment
//@access public
const createEquipment = asyncHandler(async (req, res) => {
  console.log("The request body is:\n", req.body);
  const { name, full_name, serial_number, condition, description } = req.body;
  if (!name || !full_name || !serial_number || !condition) {
    res.status(400);
    throw new Error("Required fields must be entered!");
  }

  // Provjeri postoji li oprema u bazi prema jedinstenom serijskom broju
  const existingEquipment = await Equipment.findOne({ serial_number });
  if (existingEquipment) {
    res.status(400);
    throw new Error("Equipment with serial number already added!");
  }

  const equipment = await Equipment.create({
    name, // Kada koristimo iste naziva kljuca i vrijednosti, mozemo samo pisati kljuc --> name umjesto name: name
    full_name,
    serial_number,
    condition,
    description,
  });
  res.status(201).json(equipment);
});

//@desc Get equipment
//@route GET /api/equipment/:id
//@access public
const getEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }
  res.status(200).json(equipment);
});

//@desc Update equipment
//@route PUT /api/equipment/:id
//@access public
const updateEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }
  // Validacija podataka za update
  const { error, value } = equipmentSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const updateEquipment = await Equipment.findByIdAndUpdate(
    req.params.id,
    value, // Upotreba validiranih podataka, zamjena za req.body
    {
      new: true,
    }
  );
  res.status(200).json(updateEquipment);
});

//@desc Delete equipment
//@route DELETE /api/equipment/:id
//@access public
const deleteEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found!");
  }

  const deleteEquipment = await Equipment.findByIdAndDelete(req.params.id);
  res.status(200).json(deleteEquipment);
});

module.exports = {
  getAllEquipment,
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
};
