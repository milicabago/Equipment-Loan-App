const mongoose = require("mongoose");

const UserEquipmentStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  INACTIVE: "inactive",
};

const UserEquipmentSchema = new mongoose.Schema(
  {
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
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
    },
    request: {
      type: String,
      enum: Object.values(UserEquipmentStatus),
      default: UserEquipmentStatus.PENDING, // Postavljanje na false po defaultu dok korisnik ne klikne na dugme
    },
    debit_date: {
      type: Date,
      required: [true, "Debit date is required"],
    },
    return_date: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserEquipmentModel = mongoose.model(
  "user_equipment",
  UserEquipmentSchema
);
module.exports = UserEquipmentModel;
