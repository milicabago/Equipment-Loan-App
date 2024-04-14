const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Joi = require("joi");

// Definicija sheme za validaciju ažuriranja korisnika

const adminUpdateProfileShema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  role: Joi.string().valid('admin', 'user'),
  contact: Joi.string().allow('').optional(), // Dozvoljava prazan string
  position: Joi.string().required(),
  password: Joi.string().min(8).optional(), // Opcionalno polje
});

// Definicija sheme za validaciju ažuriranja korisnika
const userUpdateSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  role: Joi.string().forbidden(), // Onemogućiti ažuriranje uloge
  contact: Joi.string().allow('').optional(), // Dozvoljava prazan string
  position: Joi.string().forbidden(), // Onemogućiti ažuriranje pozicije
  password: Joi.string().min(8).optional(), // Opcionalno polje
});

const adminUpdateSchemaForUser = Joi.object({
  role: Joi.string().valid('admin', 'user'),
  position: Joi.string(),
});

//@desc Validation email
function isValidEmail(email) {
  const emailRegex = /.+\@.+\..+/;
  return emailRegex.test(email);
}

//@desc Create New user or /** Register user (JOŠ NEODLUČENO) **/ 
//@route POST /api/admin/createUser or /** POST /api/register **/
//@access public (default role is "user")
const registerOrCreateUser = asyncHandler(async (req, res) => {
  // Unesi sve podatke u formu
  const {
    first_name,
    last_name,
    email,
    username,
    password,
    role,
    contact,
    position,
  } = req.body;
  // Provjeri jesu li svi OBVEZNI podaci uneseni (samo kontakt NIJE OBVEZAN)
  if (
    !first_name ||
    !last_name ||
    !email ||
    !username ||
    !password ||
    !position
  ) {
    res.status(400);
    throw new Error(
      "Fields for 'Fist name, Last name, Email, Username, Password, Position' are mandatory!"
    );
  }

  // Provjeri valjanost e-mail adrese
  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("Invalid email address!");
  }

  // Provjeri postoji li korisnik u bazi prema jedinstenom email-u ili username-u
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    res.status(400);
    throw new Error("User with email or username already created!");
  }
  // Hashiraj lozinku
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("Hashed password: " + hashedPassword);
  // Kreiraj novog korisnika
  const user = await User.create({
    first_name,
    last_name,
    email,
    username,
    password: hashedPassword,
    role: role ? role : "user", // Default role is "user"
    contact,
    position,
  });

  console.log(`User created: ${user}`);
  //  Ako je korisnik kreiran, vrati status 201 i podatke korisnika
  if (user) {
    res
      .status(201)
      .json({ message: "User created!", _id: user._id, email: user.email, username: user.username });
  } else {
    res.status(400);
    throw new Error("User data is not valid!");
  }

  // Funkcija za provjeru valjanosti e-mail adrese
  function isValidEmail(email) {
    const emailRegex = /.+\@.+\..+/;
    return emailRegex.test(email);
  }
});

//@desc Login user
//@route POST /api/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Provjeri jesu li svi OBVEZNI podaci uneseni za prijavu
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are mandatory!");
  }

  // Pronađi korisnika u bazi podataka na temelju jedinstvenog email-a
  const user = await User.findOne({ email });

  // Provjeri je li korisnik pronađen
  if (!user) {
    res.status(401);
    throw new Error("Invalid email!");
  }

  // Usporedi lozinku s hashiranom lozinkom
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid password!");
  }

  // Podaci korisnika koji će biti spremljeni u JWT token
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

  // Generiraj JWT token
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1hr" });
  res.cookie('jwt', accessToken, { httpOnly: true, secure: true, maxAge: 3600000 }).status(200).json({ message: "Login successful!", accessToken });
});

//@desc Current user with access token information
//@route GET /api/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  // Korisnički podaci dostupni su u `req.user` objektu koji je postavljen nakon provjere tokena
  const currentUserData = req.user;
  res.json(currentUserData);
});

//@desc Get all users (ADMIN)
//@route GET /api/admin/users
//@access private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  if (!users) {
    res.status(404);
    throw new Error("Users not found!");
  }
  // Vrati rezultat s korisnicima 
  res.status(200).json(users);
});

//@desc Get user
//@route GET /api/admin/users/:id
//@access private
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  res.status(200).json(user);
});

//@desc Get information about the current user profile
//@route GET /api/admin/settings
//@access private
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

//@desc USER update profile
//@route PUT /api/user/settings/:id 
//@access private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  // Provjeri je li korisnik koji želi ažurirati profil isti kao prijavljeni korisnik (iz tokena)
  if (user._id.toString() !== req.user.user._id) {
    res.status(403);
    throw new Error("User doesn't have permission to update another user's profile!");
  }

  // Validacija podataka za ažuriranje koristeći Joi shemu
  const { error } = userUpdateSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
  }

  // Provjeri je li novi email već zauzet
  if (req.body.email) {
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail && existingEmail._id.toString() !== req.params.id) {
      res.status(400);
      throw new Error("Email already exists!");
    }
  }

  // Provjeri je li novo korisničko ime već zauzeto
  if (req.body.username) {
    const existingUsername = await User.findOne({ username: req.body.username });
    if (existingUsername && existingUsername._id.toString() !== req.params.id) {
      res.status(400);
      throw new Error("Username already exists!");
    }
  }

  // Ažuriranje korisnika
  user.first_name = req.body.first_name;
  user.last_name = req.body.last_name;
  user.email = req.body.email;
  user.username = req.body.username;
  user.contact = req.body.contact || "";


  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();

  res.status(200).json({ message: "User updated.", updatedUser });
});

//@desc ADMIN update profile
//@route PUT /api/admin/settings/:id
//@access private
const updateAdminProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  // Provjeri je li korisnik koji želi da ažurira svoj profil isti kao i korisnik koji je prijavljen (iz tokena)
  if (user._id.toString() !== req.user.user._id) {
    res.status(403);
    throw new Error("User doesn't have permission to UPDATE another user profile!");
  }

  // Validacija podataka za update koristeći Joi shemu
  const { error } = adminUpdateProfileShema.validate(req.body, { abortEarly: false }); // Dodajemo opciju abortEarly: false kako bi prikazali sve greške

  if (error) {
    const errorMessages = error.details.map(detail => detail.message); // Mapiramo sve greške u niz
    res.status(400);
    throw new Error(errorMessages.join(', ')); // Spajamo sve greške u jednu poruku
  }

  // Provjeri je li novi email već zauzet
  if (req.body.email) {
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail && existingEmail._id.toString() !== req.params.id) {
      res.status(400);
      throw new Error("Email already exists!");
    }
  }

  // Provjeri je li novo korisničko ime već zauzeto
  if (req.body.username) {
    const existingUsername = await User.findOne({ username: req.body.username });
    if (existingUsername && existingUsername._id.toString() !== req.params.id) {
      res.status(400);
      throw new Error("Username already exists!");
    }
  }

  // Ažuriranje korisnika
  user.first_name = req.body.first_name;
  user.last_name = req.body.last_name;
  user.email = req.body.email;
  user.username = req.body.username;
  user.role = req.body.role || user.role; // Default role is "user"
  user.contact = req.body.contact || "";
  user.position = req.body.position;

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();

  res.status(200).json({ message: "User updated.", updatedUser });
});

//@desc Admin Update user profile
//@route PATCH /api/admin/users/:id
//@access private
const adminUpdateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  // Validacija podataka za update koristeći Joi shemu
  const { error } = adminUpdateSchemaForUser.validate(req.body, { abortEarly: false }); // Dodajemo opciju abortEarly: false kako bi prikazali sve greške

  if (error) {
    const errorMessages = error.details.map(detail => detail.message); // Mapiramo sve greške u niz
    res.status(400);
    throw new Error(errorMessages.join(', ')); // Spajamo sve greške u jednu poruku
  }

  // Provjeri je li se mijenjaju osim role i position
  const allowedUpdates = ['role', 'position']; // Dozvoljene promjene
  const requestedUpdates = Object.keys(req.body);
  const isUpdateValid = requestedUpdates.every(update => allowedUpdates.includes(update));

  if (!isUpdateValid) {
    res.status(400);
    throw new Error("You can only update role and position!");
  }

  // Ažuriranje korisnika
  user.role = req.body.role || user.role; // Default role is "user"
  user.position = req.body.position || user.position;

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();

  res.status(200).json({ message: "User updated.", updatedUser });
});

//@desc Delete user
//@route DELETE /api/admin/users/:id
//@access private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }
  let deleteUser = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "User has been deleted!", deleteUser });
});

module.exports = {
  registerOrCreateUser,
  loginUser,
  currentUser,
  getAllUsers,
  getUser,
  getUserProfile,
  adminUpdateUser,
  updateUserProfile,
  updateAdminProfile,
  deleteUser,
};
