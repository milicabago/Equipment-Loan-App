const mongoose = require("mongoose");
const EquipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    full_name: {
      type: String,
      required: [true, "Model name is required"],
    },
    serial_number: {
      type: String,
      required: [true, "Serial number is required"],
      unique: true,
    },
    condition: {
      type: Boolean,
      required: [true, "Condition is required"],
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Equipment --> podrazumijeva kolekciju u bazi podataka equipments
const EquipmentModel = mongoose.model("equipment", EquipmentSchema);
module.exports = EquipmentModel;
