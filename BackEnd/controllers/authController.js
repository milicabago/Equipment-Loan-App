const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const nodeMailer = require('nodemailer');
/** Models **/
const User = require('../models/userModel');

/** 
 * @desc Link for a forgotten password is sent by email
 * @route POST /api/forgotPassword
 * @access public 
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Validation schema for email 
    const emailSchema = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2 }).required().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).messages({
            'string.pattern.base': 'Email is not valid!',
        }),
    });

    // Validation errors of user input
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
 *  @route PATCH /api/resetPassword/:userId/:token
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

    // Validation schema for new password
    const newPasswordSchema = Joi.object({
        newPassword: Joi.string().min(8).required(),
    });

    // Validation errors of user input
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

module.exports = { forgotPassword, resetPassword };