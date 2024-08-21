const mongoose = require("mongoose");
/** Constants **/
const { UserEquipmentStatus } = require("../constants");

const AdminHistorySchema = new mongoose.Schema(
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
        unassigned_quantity: {
            type: Number,
            required: [true, "Quantity is required"],
        },
        unassign_date: {
            type: Date,
            required: [true, "Unassign date is required"],
        },
        return_status_request: {
            type: String,
            enum: Object.values(UserEquipmentStatus),
        },
    },
    {
        timestamps: true,
        collection: "admin_history",
    }
);

const AdminHistoryModel = mongoose.model("admin_history", AdminHistorySchema);

module.exports = AdminHistoryModel;