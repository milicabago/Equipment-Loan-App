const mongoose = require("mongoose");

const UserEquipmentStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  INACTIVE: "inactive",
  DENIED: "denied",
  RETURNED: "returned",
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
    request_status: {
      type: String,
      enum: Object.values(UserEquipmentStatus),
      default: UserEquipmentStatus.INACTIVE,
    },
    return_status_request: {
      type: String,
      enum: Object.values(UserEquipmentStatus),
      default: UserEquipmentStatus.RETURNED,
    },
    assign_date: {
      type: Date,
      required: [true, "Debit date is required"],
    },
    unassign_date: {
      type: Date,
      required: false,
    },
    unassigned_quantity: {
      type: Number, // Dodajte polje za razduženu količinu opreme
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "user_equipment",
  }
);

const UserEquipmentModel = mongoose.model(
  "user_equipment",
  UserEquipmentSchema
);
module.exports = UserEquipmentModel;
