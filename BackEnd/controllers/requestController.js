const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const Request = require("../models/userEquipmentModel");

//@desc Get all equipments
//@route GET /api/equipment
//@access public
const getAllRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({});
  res.status(200).json(requests);
});

//@desc Create New equipment
//@route POST /api/equipment
//@access public
const checkRequest = asyncHandler(async (req, res) => {
  console.log("The request body is:\n", req.body);
  const { debit_date, return_date, quantity, request } = req.body;
  if (!debit_date || !quantity || !request) {
    res.status(400);
    throw new Error("Required fields must be entered!");
  }

  res.status(201).json(request);
});

/*
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
*/
