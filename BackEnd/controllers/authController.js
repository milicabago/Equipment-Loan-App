/** Modules **/
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
/** Models **/
const User = require('../models/userModel');

//@desc Link for forgot password send email
//@route POST /api/forgotPassword
//@access public
const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;

        // Pretraga korisnika u bazi podataka na osnovu email adrese
        const user = await User.findOne({ email: email });

        // Ako korisnik nije pronađen, vraćamo odgovarajući status odgovora i bacamo grešku
        if (!user) {
            res.status(404);
            throw new Error("User not found!");
        }

        // Generisanje JWT tokena za resetovanje lozinke sa podacima korisnikovog ID-ja
        const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10min' });

        // Konfiguracija transportera za slanje emaila pomoću nodemailer biblioteke
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            },
        });

        // Definisanje opcija za email koji šaljemo
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: 'Reset your password!',
            text: `Click on the link to reset your password: ${process.env.RESET_PASSWORD_URL}/${user._id}/${accessToken}` // front url
        };

        // Slanje emaila
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                // Ukoliko dođe do greške prilikom slanja emaila, logujemo je i vraćamo odgovor sa statusom 500
                console.log(`Error in sending email: ${error}`);
                res.status(500);
                throw new Error('Internal Server Error');
            } else {
                // Ukoliko je email uspješno poslat, logujemo potvrdu slanja i vraćamo odgovor sa statusom 200
                console.log(`Email sent: ${info.response}`);
                res.status(200).json({ message: 'Email has been sent.' });
            }
        });
    }
    catch (error) {
        // Hvatanje grešaka i vraćanje odgovora sa statusom 500 u slučaju greške
        console.error(`Error in forgotPassword controller: ${error}`);
        res.status(500);
        throw new Error('Internal Server Error');
    }
});


//@desc Link for reset password with token on mail
//@route PATCH /api/resetPassword
//@access private
const resetPassword = asyncHandler(async (req, res) => {
    try {
        const id = req.user._id;
        const { newPassword } = req.body;
        const user = await User.findById(id);

        if (!user) {
            res.status(404);
            throw new Error("User not found!");
        }

        if (newPassword.length < 8) {
            res.status(400);
            throw new Error("Password must be at least 8 characters long!");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Spremanje nove lozinke u bazu podataka za traženog korisnika
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    password: hashedPassword
                }
            },
            { new: true } // Postavka koja vraća ažurirani dokument
        );

        // Dohvaćanje svih atributa osim atributa 'password' iz ažuriranog korisničkog zapisa
        const { password: pass, ...rest } = updatedUser._doc;
        // Vraćanje ažuriranih korisničkih podataka bez lozinke
        return res.status(201).json(rest);

    } catch (error) {
        console.error(`Error in resetPassword controller: ${error}`);
        res.status(500);
        throw new Error('Internal Server Error');
    }
});

module.exports = { forgotPassword, resetPassword };