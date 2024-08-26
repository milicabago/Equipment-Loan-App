const mongoose = require("mongoose");
/** Constants **/
const { UserEquipmentStatus } = require("../constants");

const UserHistorySchema = new mongoose.Schema(
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
        collection: "user_history",
    }
);

// Define TTL index to automatically delete history after 30 days
UserHistorySchema.index({ unassign_date: 1 }, { expireAfterSeconds: 2592000 }); // 30 days in seconds

const UserHistoryModel = mongoose.model("user_history", UserHistorySchema);

module.exports = UserHistoryModel;
