const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const Joi = require("joi");
/** Models **/
const User = require("../models/userModel");
const UserEquipment = require("../models/userEquipmentModel");
const UserHistory = require("../models/userHistoryModel");
const AdminHistory = require("../models/adminHistoryModel")
const Notification = require("../models/notificationModel");
/** Constants **/
const { UserEquipmentStatus } = require("../constants");

/**
 * @desc Create New user
 * @route POST /api/admin/createUser
 * @access private
 */
const createUser = asyncHandler(async (req, res) => {

    const { first_name, last_name, email, username, password, role, contact, position } = req.body;

    // User validation schema
    const userSchema = Joi.object({
        first_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({ // za koristenje početnih i završnih razmaka trim() dodati ispred pattern
            'string.pattern.base': 'First name - Too many spaces entered!',
        }),
        last_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
            'string.pattern.base': 'Last name - Too many spaces entered!',
        }),
        email: Joi.string().email({ minDomainSegments: 2 }).required().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).messages({
            'string.pattern.base': 'Email is not valid!',
        }),
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().valid("admin", "user").optional(),
        contact: Joi.string().allow("").optional().pattern(/^(\S+\s)*\S+$/).messages({
            'string.pattern.base': 'Contact - Too many spaces entered!',
        }),
        position: Joi.string().optional().pattern(/^(\S+\s)*\S+$/).messages({
            'string.pattern.base': 'Position - Too many spaces entered!',
        }),
    });

    // Display validation messages using Joi schema
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        res.status(400);
        throw new Error(errorMessages.join(', '));
    }

    // Check if user exists in the database by unique email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        res.status(400);
        throw new Error("User with email or username already created!");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password: " + hashedPassword);

    // Create a new user
    const user = await User.create({
        first_name,
        last_name,
        email,
        username,
        password: hashedPassword,
        role, // Default role is "user"
        contact,
        position,
    });

    // If user is created, return status 201 and user data
    if (user) {
        res
            .status(201)
            .json({ message: "User created!", _id: user._id, email: user.email, username: user.username });
    } else {
        res.status(400);
        throw new Error("User data is not valid!");
    }
});

/**
 * @desc Get all users except the logged-in ADMIN
 * @route GET /api/admin/users
 * @access private
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const loginAdminId = req.user.user._id;
    // Find all users except the logged-in ADMIN
    const users = await User.find({ _id: { $ne: loginAdminId } }).sort({ first_name: 1, last_name: 1 });

    if (!users) {
        res.status(404);
        throw new Error("Users not found!");
    }
    // Return result with users
    res.status(200).json(users);
});

/**
 * @desc Get user
 * @route GET /api/admin/users/:id
 * @access private
 */
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found!");
    }

    res.status(200).json(user);
});

/**
 * @decs Admin Update USER profile or another ADMIN profile + NOTIFICATION
 * @route PATCH /api/admin/users/:id
 * @access private
 */
const adminUpdateUserOrAdmin = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found!");
    }

    const adminUpdateSchemaForUserOrAdmin = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        role: Joi.string().valid("admin", "user").required(),
        position: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
            'string.pattern.base': 'Position - Too many spaces entered!',
        }),
    });

    const { error } = adminUpdateSchemaForUserOrAdmin.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        res.status(400);
        throw new Error(errorMessages.join(', '));
    }

    const { username, role, position } = req.body;

    const existingUser = await User.findOne({ $and: [{ _id: { $ne: user._id } }, { username }] });
    if (existingUser) {
        res.status(400);
        throw new Error("User with email or username already exists!");
    }

    const changes = [];
    if (user.role !== role) changes.push(`ROLE changed:\n${user.role} -> ${role}`);
    if (user.username !== username) changes.push(`USERNAME changed:\n${user.username} -> ${username}`);
    if (user.position !== position) changes.push(`POSITION changed:\n${user.position} -> ${position}`);

    user.username = username;
    user.role = role;
    user.position = position;

    // Check for active or pending equipment requests if role is changed to admin
    if (role === "admin") {
        const activeOrPendingRequests = await UserEquipment.find({
            user_id: user._id,
            $or: [
                { request_status: "active" },
                { request_status: "pending" },
                { return_status_request: "pending" }
            ]
        });

        if (activeOrPendingRequests.length > 0) {
            res.status(400);
            throw new Error("User has active or pending\nequipment requests!");
        }
    }

    const updatedUser = await user.save();

    // Delete all notifications if the role is changed
    if (changes.some(change => change.includes('ROLE changed'))) {
        await Notification.deleteMany({ user_id: user._id });
    }

    // Send a single notification with all changes
    // const notificationMessage = `Admin has updated your profile:\n${changes.join(', ')}`;
    const notificationMessage = `Admin has updated your profile:\n${changes.join(', ')}`;

    // Send notifications
    const notification = new Notification({
        user_id: user._id,
        sender: "admin",
        message: notificationMessage,
        createdAt: new Date()
    });
    await notification.save();

    if (req.io) {
        req.io.to(user._id.toString()).emit('adminUpdateUserOrAdminProfile', notification);
    } else {
        console.error("Socket.IO is not available!");
    }

    res.status(200).json({ message: "User or Admin profile updated.", updatedUser });
});

/**
 * @desc Delete user
 * @route DELETE /api/admin/users/:id
 * @access private
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found!");
    }

    const userEquipment = await UserEquipment.find({ user_id: user._id });

    // Check user equipment assignments
    if (userEquipment && userEquipment.some(eq => eq.request_status === UserEquipmentStatus.ACTIVE)) {
        res.status(403);
        throw new Error("User has equipment assigned. Please unassign equipment before deleting the user!");
    }

    if (userEquipment && userEquipment.some(eq => eq.request_status === UserEquipmentStatus.PENDING)) {
        res.status(403);
        throw new Error("User has pending request. Please resolve request before deleting the user!");
    }

    // Delete equipment from history for the selected user
    await UserHistory.deleteMany({ user_id: user._id });
    await AdminHistory.deleteMany({ user_id: user._id });

    const deleteUser = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User has been deleted!", deleteUser });
});

/** 
 * @desc Get information about the current admin profile
 * @route GET /api/admin/settings
 * @access private
*/
const getAdminProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error("User is not authenticated!");
    }

    const user = await User.findById(req.user.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found!");
    }

    res.status(200).json(user);
});

/**
 * @desc ADMIN update profile
 * @route PUT /api/admin/settings/:id
 * @access private
 */
const updateAdminProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found!");
    }

    // Verify if the user updating the profile is the same as the logged-in user (from token)
    if (user._id.toString() !== req.user.user._id) {
        res.status(403);
        throw new Error("User doesn't have permission to UPDATE another user profile!");
    }

    // Admin update personal data - Validation schema
    const adminUpdateProfileShema = Joi.object({
        first_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
            'string.pattern.base': 'First name - Too many spaces entered!',
        }),
        last_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
            'string.pattern.base': 'Last name - Too many spaces entered!',
        }),
        email: Joi.string().email({ minDomainSegments: 2 }).required().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).messages({
            'string.pattern.base': 'Email is not valid!',
        }),
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).optional(),
        contact: Joi.string().allow("").optional().pattern(/^(\S+\s)*\S+$/).messages({
            'string.pattern.base': 'Contact - Too many spaces entered!',
        }),
        position: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
            'string.pattern.base': 'Position - Too many spaces entered!',
        }),
    });

    // Display validation messages using Joi schema
    const { error } = adminUpdateProfileShema.validate(req.body, { abortEarly: false }); // Add option abortEarly: false -> to display all errors

    if (error) {
        const errorMessages = error.details.map(detail => detail.message); // Map all errors to an array 
        res.status(400);
        throw new Error(errorMessages.join(', ')); //Connect all errors in one message
    }

    // Verify if the new email is already in use
    if (req.body.email) {
        const existingEmail = await User.findOne({ email: req.body.email });
        if (existingEmail && existingEmail._id.toString() !== req.params.id) {
            res.status(400);
            throw new Error("Email already exists!");
        }
    }

    // Verify if the new username is already in use
    if (req.body.username) {
        const existingUsername = await User.findOne({ username: req.body.username });
        if (existingUsername && existingUsername._id.toString() !== req.params.id) {
            res.status(400);
            throw new Error("Username already exists!");
        }
    }

    // Update user
    // If required(), no need to use previous value || user.first_name, etc.
    // If optional(), must use previous value || user.first_name, etc.
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;
    user.contact = req.body.contact || user.contact || "";
    user.position = req.body.position || user.position;

    if (req.body.password) {
        // Check New Password is the same as the Current Password
        const isSamePassword = await bcrypt.compare(req.body.password, user.password);
        if (isSamePassword) {
            res.status(400);
            throw new Error("Enter a new password!");
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({ message: "User updated.", updatedUser });
});

module.exports = { createUser, getAllUsers, getUser, adminUpdateUserOrAdmin, deleteUser, getAdminProfile, updateAdminProfile };