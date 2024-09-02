const mongoose = require("mongoose");
/** Constants **/
const { UserEquipmentStatus } = require("../constants");

const AdminHistorySchema = new mongoose.Schema(
    {
        admin_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Admin ID is required"],
        },
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
        assign_date: {
            type: Date,
            required: [true, "Assign date is required"],
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

// Define TTL index to automatically delete history after 30 days
AdminHistorySchema.index({ unassign_date: 1 }, { expireAfterSeconds: 2592000 }); // 30 days in seconds

const AdminHistoryModel = mongoose.model("admin_history", AdminHistorySchema);

module.exports = AdminHistoryModel;