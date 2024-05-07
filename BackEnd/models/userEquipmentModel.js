const mongoose = require("mongoose");
/** Constants **/
const { UserEquipmentStatus } = require("../constants");

const UserEquipmentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    equipment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "equipment",
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
      default: UserEquipmentStatus.INACTIVE,
    },
    assign_date: {
      type: Date,
      required: [true, "Assign date is required"],
    },
    unassign_date: {
      type: Date,
      default: null,
      required: false,
    },
    unassigned_quantity: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "user_equipment",
  }
);

const UserEquipmentModel = mongoose.model("user_equipment", UserEquipmentSchema);

module.exports = UserEquipmentModel;
