const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Joi = require("joi");

//@desc1 Register user
//@desc2 Create New user
//@route1 POST /api/register
//@route2 POST /api/admin/createUser
//@access1 public
//@access2 private (only admin)
const registerOrCreateUser = asyncHandler(async (req, res) => {

  const { first_name, last_name, email, username, password, confirm_password, role, contact, position } = req.body;

  // User validation schema
  const userSchema = Joi.object({
    first_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({ // za koristenje početnih i završnih razmaka trim() dodati ispred pattern
      'string.pattern.base': '\"first_name\" cannot contain multiple consecutive spaces!',
    }),
    last_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"last_name\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).required(),
    confirm_password: Joi.string().valid(Joi.ref('password')).required().label('Confirm password').messages({
      'any.only': 'Passwords must match',
    }),
    role: Joi.string().valid("admin", "user").optional(),
    contact: Joi.string().allow("").optional().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"contact\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    position: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"position\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
  });

  // Validacija podataka korisnika koristeći Joi shemu
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
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

  //  Ako je korisnik kreiran, vrati status 201 i podatke korisnika
  if (user) {
    res
      .status(201)
      .json({ message: "User created!", _id: user._id, email: user.email, username: user.username });
  } else {
    res.status(400);
    throw new Error("User data is not valid!");
  }
});

//@desc Login user
//@route POST /api/login
//@access public
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

  // Provjeri je li korisnik pronađen
  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  // Provjeri je li lozinka ispravna
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid email or password!");
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

  // Generate JWT token
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1hr" });
  res.cookie('jwt', accessToken, { httpOnly: true, secure: true, maxAge: 3600000 }).status(200).json({ message: "Login successful!", accessToken });
});

//@desc Current user with access token information
//@route GET /api/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  // Korisnički podaci dostupni su u `req.user` objektu koji je postavljen nakon provjere tokena
  const currentUserData = req.user;
  if (currentUserData) {
    // Korisnik je prijavljen, ispiši poruku da je trenutni korisnik prijavljen
    currentUserData.iat = new Date(currentUserData.iat * 1000).toLocaleString();
    currentUserData.exp = new Date(currentUserData.exp * 1000).toLocaleString();

    res.json({
      message: `User \'${currentUserData.user.first_name} ${currentUserData.user.last_name}\' is logged.`,
      user: currentUserData,
    });
  } else {
    // Korisnik nije prijavljen
    res.json({ message: "No user logged in." });
  }
});

//@desc Get all users (ADMIN)
//@route GET /api/admin/users
//@access private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ first_name: 1, last_name: 1 });

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

  // User validation 
  const updateUserSchema = Joi.object({
    first_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"first_name\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    last_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"last_name\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    role: Joi.string().forbidden(),
    contact: Joi.string().allow('').optional().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"contact\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    position: Joi.string().forbidden(),
    password: Joi.string().min(8).optional(),
  });

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
  const { error } = updateUserSchema.validate(req.body, { abortEarly: false });

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

  //****** PROVJERITI SA MENTOROM da li kada je UPDATE vrijednosti staviti na REQUIRED ili ostaviti OPTIONAL *******/
  // Definicija sheme za validaciju ažuriranja korisnika
  const adminUpdateProfileShema = Joi.object({
    first_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"first_name\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    last_name: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"last_name\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).optional(),
    role: Joi.string().valid('admin', 'user').optional(),
    contact: Joi.string().allow('').optional().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"contact\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
    position: Joi.string().required().pattern(/^(\S+\s)*\S+$/).messages({
      'string.pattern.base': '\"position\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
  });

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
  // Ako je required() onda se ne mora stavljati prethodna vrijednost || user.first_name itd.
  // Ako je optional() onda se mora staviti prethodna vrijednost || user.first_name itd.
  user.first_name = req.body.first_name || user.first_name;
  user.last_name = req.body.last_name || user.last_name;
  user.email = req.body.email || user.email;
  user.username = req.body.username || user.username;
  user.role = req.body.role || user.role; // Default role is "user"
  user.contact = req.body.contact || "";
  user.position = req.body.position || user.position;

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

  // Validation schema
  const adminUpdateSchemaForUser = Joi.object({
    email: Joi.string().email().optional(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    role: Joi.string().valid('admin', 'user').optional(),
    position: Joi.string().optional().pattern(/^(\S+\s)*\S+$/).messages({ // za dodavanje početnih i završnih razmaka trim() dodati ispred pattern
      'string.pattern.base': '\"position\" cannot start or end with spaces, or contain multiple consecutive spaces!',
    }),
  });

  // Validacija podataka za update koristeći Joi shemu
  const { error } = adminUpdateSchemaForUser.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    res.status(400);
    throw new Error(errorMessages.join(', '));
  }

  const { email, username } = req.body;

  // Provjeri postoji li korisnik u bazi prema jedinstenom email-u ili username-u
  const existingUser = await User.findOne({ $and: [{ _id: { $ne: user._id } }, { $or: [{ email }, { username }] }] });
  if (existingUser) {
    res.status(400);
    throw new Error("User with email or username already exists!");
  }

  // Ažuriranje korisnika
  user.email = req.body.email || user.email;
  user.username = req.body.username || user.username;
  user.role = req.body.role || user.role;
  user.position = req.body.position || user.position;

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
  const deleteUser = await User.findByIdAndDelete(req.params.id);
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
