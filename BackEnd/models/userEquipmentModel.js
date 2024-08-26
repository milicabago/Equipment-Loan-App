const mongoose = require("mongoose");
/** Constants **/
const { UserEquipmentStatus } = require("../constants");
const { required } = require("joi");

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
    unassign_quantity: {
      type: Number,
      default: 0,
      required: [true, "Unassign quantity is required"],
    },
    request_status: {
      type: String,
      enum: Object.values(UserEquipmentStatus),
      default: UserEquipmentStatus.INACTIVE,
    },
    return_status_request: {
      type: String,
      enum: Object.values(UserEquipmentStatus),
      default: UserEquipmentStatus.INACTIVE,
    },
    assign_date: {
      type: Date,
      required: [true, "Assign date is required"],
    },
    unassign_date: {
      type: Date,
      default: null,
      required: [false, "Assign date is not required"],
    },
  },
  {
    timestamps: true,
    collection: "user_equipment",
  }
);

const UserEquipmentModel = mongoose.model("user_equipment", UserEquipmentSchema);

module.exports = UserEquipmentModel;