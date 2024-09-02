
const asyncHandler = require("express-async-handler");
/** Models **/
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

/**** Manage NOTIFICATIONS ****/

/**
 * @desc Generate notification to specific ADMIN or USER
 * @route POST /api/notifications
 * @access private
 */
const createNotification = asyncHandler(async (req, res, next) => {
    try {
        const { user_id, message, sender } = req.body; // Include sender in the request body
        const newNotification = new Notification({ user_id, message, sender });
        await newNotification.save();

        const user = await User.findById(user_id);
        if (!user) {
            res.status(400);
            throw new Error('User not found!');
        }

        res.status(201).json({ message: 'Notification CREATED.', notification: newNotification });
    } catch (error) {
        next(error); // Forwarding error to errorHandler (middleware)
    }
});

/**
 * @desc Get notifications for specific ADMIN or USER
 * @route GET /api/allNotifications
 * @access private
 */
const getNotifications = asyncHandler(async (req, res, next) => {
    try {
        const loginUserId = req.user.user._id;
        let notifications;

        if (req.user.user.role === 'admin') {
            // Find notifications specific to this admin
            notifications = await Notification.find({ user_id: loginUserId }).sort({ createdAt: -1 });
        } else {
            // Find notifications for the logged-in user sent by admins
            notifications = await Notification.find({ user_id: loginUserId, sender: 'admin' }).sort({ createdAt: -1 });
        }

        if (notifications.length === 0) {
            res.status(404);
            throw new Error("Notifications are empty!");
        } else {
            res.status(200).json(notifications);
        }
    } catch (error) {
        next(error); // Forwarding error to errorHandler (middleware)
    }
});

/**
 * @desc Set notification viewed
 * @route PATCH /api/notifications/:id/read"
 * @access private
 */
const readNotification = asyncHandler(async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            res.status(404);
            throw new Error("Notification not found!");
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({ message: "Notification marked as read.", notification });
    } catch (error) {
        next(error); // Forwarding error to errorHandler (middleware)
    }
});

/**
 * @desc Delete notification
 * @route DELETE /api/notifications/:id
 * @access private
 */
const deleteNotification = asyncHandler(async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            res.status(404);
            throw new Error("Notification not found!");
        }

        res.status(200).json({ message: "Notification DELETED.", notification });
    } catch (error) {
        next(error); // Forwarding error to errorHandler (middleware)
    }
});

/**
 * @desc Delete all notifications for the logged-in user
 * @route DELETE /api/deleteAllNotifications
 * @access private
 */
const deleteAllNotifications = asyncHandler(async (req, res, next) => {
    try {
        const loginUserId = req.user.user._id;

        const result = await Notification.deleteMany({ user_id: loginUserId });

        if (result.deletedCount === 0) {
            res.status(404);
            throw new Error("No notifications found to delete!");
        }

        res.status(200).json({ message: "All notifications DELETED." });
    } catch (error) {
        next(error); // Forwarding error to errorHandler (middleware)
    }
});

module.exports = {
    createNotification,
    getNotifications,
    readNotification,
    deleteNotification,
    deleteAllNotifications
};
