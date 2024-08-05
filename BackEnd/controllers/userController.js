const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const Joi = require("joi");
/** Models **/
const User = require("../models/userModel");

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
 * @desc USER update profile
 * @route PUT /api/user/settings/:id
 * @access private 
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  // Verify if the user updating the profile is the same as the logged-in user (from token)
  if (user._id.toString() !== req.user.user._id) {
    res.status(403);
    throw new Error("User doesn't have permission to UPDATE another user's profile!");
  }

  // User validation schema
  const updateUserSchema = Joi.object({
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
    role: Joi.string().forbidden(),
    contact: Joi.string().allow("").optional().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': 'Contact - Too many spaces entered!',
    }),
    position: Joi.string().forbidden(),
    password: Joi.string().min(8).optional(),
  });

  // Display validation error messages using Joi schema
  const { error } = updateUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
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
  user.first_name = req.body.first_name || user.first_name;
  user.last_name = req.body.last_name || user.last_name;
  user.email = req.body.email || user.email;
  user.username = req.body.username || user.username;
  user.contact = req.body.contact || user.contact || "";


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

module.exports = {
  getUserProfile,
  updateUserProfile,
};
