const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const nodeMailer = require('nodemailer');
/** Models **/
const User = require('../models/userModel');

/**
 * @desc Register user
 * @route POST /api/register 
 * @access public
 */
// const registerUser = asyncHandler(async (req, res) => {

//     const { first_name, last_name, email, username, password, position } = req.body;

//     // User validation schema
//     const userSchema = Joi.object({
//         first_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({ // za koristenje početnih i završnih razmaka trim() dodati ispred pattern
//             'string.pattern.base': '\"first_name\" cannot contain multiple consecutive spaces!',
//         }),
//         last_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
//             'string.pattern.base': '\"last_name\" cannot start or end with spaces, or contain multiple consecutive spaces!',
//         }),
//         email: Joi.string().email({ minDomainSegments: 2 }).required().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).messages({
//             'string.pattern.base': '\"email\" is not valid!',
//         }),
//         username: Joi.string().alphanum().min(3).max(30).required(),
//         password: Joi.string().min(8).required(),
//         position: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
//             'string.pattern.base': '\"position\" cannot start or end with spaces, or contain multiple consecutive spaces!',
//         }),
//     });

//     // Display validation messages using Joi schema
//     const { error } = userSchema.validate(req.body, { abortEarly: false });
//     if (error) {
//         const errorMessages = error.details.map(detail => detail.message);
//         res.status(400);
//         throw new Error(errorMessages.join(', '));
//     }

//     // Check if user exists in the database by unique email or username
//     const existingUser = await User.findOne({ $or: [{ email }, { username }] });
//     if (existingUser) {
//         res.status(400);
//         throw new Error("User with email or username already created!");
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     console.log("Hashed password: " + hashedPassword);

//     // Create a new user
//     const user = await User.create({
//         first_name,
//         last_name,
//         email,
//         username,
//         password: hashedPassword,
//         role: "user", // Default role is "user"
//         contact: "",
//         position,
//     });

//     // If user is created, return status 201 and user data
//     if (user) {
//         res
//             .status(201)
//             .json({ message: "User created!", _id: user._id, email: user.email, username: user.username });
//     } else {
//         res.status(400);
//         throw new Error("User data is not valid!");
//     }
// });

/** 
 * @desc Login user
 * @route POST /api/login
 * @access public
*/
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Login validation
    const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        res.status(400);
        throw new Error(errorMessages.join(', '));
    }

    const user = await User.findOne({ email });

    // Check is user found
    if (!user) {
        res.status(404);
        throw new Error("User not found!");
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Invalid email or password!");
    }

    // User data that will be saved in the JWT token
    const payload = {
        user: {
            _id: user._id,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            username: user.username,
        }
    };

    // Generate JWT token
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24hr" });
    res.cookie('jwt', accessToken, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 }).status(200).json({ message: "Login successful!", accessToken });
});

/** 
 * @desc Link for a forgotten password is sent by email
 * @route POST /api/forgotPassword
 * @access public 
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Email - Validation schema 
    const emailSchema = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2 }).required().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).messages({
            'string.pattern.base': 'Email is not valid!',
        }),
    });

    // Display validation error messages using Joi schema
    const { error } = emailSchema.validate(req.body, { abortEarly: true });
    if (error) {
        const errorMessages = error.details.filter(detail => ['string.email', 'string.pattern.base'].includes(detail.type)).map(detail => detail.message);
        if (errorMessages.length > 0) {
            res.status(400);
            throw new Error("Invalid email address!");
        }
    }

    if (!user) {
        res.status(404);
        throw new Error('User not found!');
    }

    // Generating JWT token for password reset with user ID
    const accessToken = jwt.sign({ email: user.email, _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });

    // Configuring email transporter using the Nodemailer library
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        },
    });

    // Defining options for the email we are sending
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'Reset your password!',
        text: `Click on the password reset link: ${process.env.RESET_PASSWORD_URL}/${user._id}/${accessToken}` // FrontEnd link for reset password
    };

    // Sending to email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(`Error in sending email: ${error}`);
            res.status(500);
            throw new Error('Internal Server Error');
        } else {
            console.log(`Email sent: ${info.response}`);
            res.status(200).json({ message: 'Email sent successfully.' });
        }
    });
});

/**
 * @desc Password reset link with ID and TOKEN in email
 * @route PATCH /api/resetPassword/:userId/:token
 * @access private
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error("User not found!");
    }

    // New password - Validation schema
    const newPasswordSchema = Joi.object({
        newPassword: Joi.string().min(8).required(),
    });

    // Display validation error messages using Joi schema
    const { error } = newPasswordSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        res.status(400);
        throw new Error(errorMessages.join(', '));
    }

    // Check New Password is the same as the Current Password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        res.status(400);
        throw new Error("Enter a new password!");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
});

/**
 * @desc Current user with access token information
 * @route GET /api/current
 * @access private
 */
const currentUser = asyncHandler(async (req, res) => {
    // User data is available in the `req.user` object set after token verification
    const currentUserData = req.user;
    if (currentUserData) {
        // Print a message that the current USER is is logged in
        currentUserData.iat = new Date(currentUserData.iat * 1000).toLocaleString();
        currentUserData.exp = new Date(currentUserData.exp * 1000).toLocaleString();

        res.json({
            message: `User \'${currentUserData.user.first_name} ${currentUserData.user.last_name}\' is logged in.`,
            user: currentUserData,
        });
    } else {
        // If there is no user data, print a message that NO USER is logged in
        res.json({ message: "No user logged in." });
    }
});

module.exports = { /* registerUser, */ loginUser, forgotPassword, resetPassword, currentUser };