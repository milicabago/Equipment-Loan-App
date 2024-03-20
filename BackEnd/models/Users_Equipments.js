const mongoose = require("mongoose");

const UserEquipmentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  equipment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment",
    required: [true, "Equipment ID is required"],
  },
  debit_date: {
    type: Date,
    required: [true, "Debit date is required"],
  },
  return_date: {
    type: Date,
    required: false,
  },
});

const UserEquipmentModel = mongoose.model(
  "user_equipments",
  UserEquipmentSchema
);
module.exports = UserEquipmentModel;
