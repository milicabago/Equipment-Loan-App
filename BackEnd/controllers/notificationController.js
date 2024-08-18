
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
        const { user_id, message } = req.body;
        const newNotification = new Notification({ user_id, message });
        await newNotification.save();

        const user = await User.findById(user_id)
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

        // Find notifications for the logged-in user
        const notifications = await Notification.find({ user_id: loginUserId }).sort({ createdAt: -1 }).limit(5); // Limit to the most recent 5 notifications

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

module.exports = {
    createNotification,
    getNotifications,
    readNotification,
    deleteNotification
};
