const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const Joi = require("joi");
/** Models **/
const User = require("../models/userModel");
const UserEquipment = require("../models/userEquipmentModel");
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
        position: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
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
        role: role || "user", // Default role is "user"
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
 * @desc Get all users
 * @route GET /api/admin/users
 * @access private
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).sort({ first_name: 1, last_name: 1 });

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
 * @decs Admin Update user profile
 * @route PATCH /api/admin/users/:id
 * @access private
 */
const adminUpdateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found!");
    }

    // Validation schema
    const adminUpdateSchemaForUser = Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().alphanum().min(3).max(30).required(),
        role: Joi.string().valid("admin", "user").required(),
        position: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({ // za dodavanje početnih i završnih razmaka trim() dodati ispred pattern
            'string.pattern.base': 'Position - Too many spaces entered!',
        }),
    });

    // Display validation messages using Joi schema
    const { error } = adminUpdateSchemaForUser.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        res.status(400);
        throw new Error(errorMessages.join(', '));
    }

    const { email, username } = req.body;

    // Check if user exists in the database by unique email or username
    const existingUser = await User.findOne({ $and: [{ _id: { $ne: user._id } }, { $or: [{ email }, { username }] }] });
    if (existingUser) {
        res.status(400);
        throw new Error("User with email or username already exists!");
    }

    // Update user data
    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;
    user.role = req.body.role || user.role;
    user.position = req.body.position || user.position;

    const updatedUser = await user.save();

    res.status(200).json({ message: "User updated.", updatedUser });
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

    const deleteUser = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User has been deleted!", deleteUser });
});

/** 
 * @desc Get information about the current user profile
 * @route GET /api/admin/settings
 * @access private
*/
const getUserProfile = asyncHandler(async (req, res) => {
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

    // Validation schema
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
    const { error } = adminUpdateProfileShema.validate(req.body, { abortEarly: false }); // Dodajemo opciju abortEarly: false kako bi prikazali sve greške

    if (error) {
        const errorMessages = error.details.map(detail => detail.message); // Mapiramo sve greške u niz
        res.status(400);
        throw new Error(errorMessages.join(', ')); // Spajamo sve greške u jednu poruku
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

module.exports = { createUser, getAllUsers, getUser, adminUpdateUser, deleteUser, getUserProfile, updateAdminProfile };