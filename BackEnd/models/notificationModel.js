const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        sender: {
            type: String,
            enum: ["user", "admin"],
            required: [true, "Receiver is required"],
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
        },
    }
);

// Define TTL index to automatically delete notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days in seconds

const NotificationModel = mongoose.model("Notification", NotificationSchema);

module.exports = NotificationModel;