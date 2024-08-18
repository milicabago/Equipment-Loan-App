const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
        },
        read: {
            type: Boolean,
            default: false,
            required: [true, "Read status is required"],
        },
        createdAt: {
            type: Date,
            required: [true, "Create date is required"],
            expires: '30d', // Automatically deletes notifications after 30 days
        },
    }
);

const NotificationModel = mongoose.model("Notification", NotificationSchema);

module.exports = NotificationModel;