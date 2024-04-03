const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//@desc Create New user
//@route POST /api/users/create_user
//@access public  /* Kasnije prebaciti --> private */
const createUser = asyncHandler(async (req, res) => {
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
    (!email && !username) || // Može se koristiti email ili username
    !password ||
    !role ||
    !position
  ) {
    res.status(400);
    throw new Error(
      "Fields for 'fistname, lastname, email, username, password, role, position' are mandatory!"
    );
  }
  // Provjeri postoji li korisnik u bazi prema jedinstenom email-u ili username-u
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    res.status(400);
    throw new Error("User with email or username already created!");
  }
  // Hashiraj lozinku
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed password: " + hashedPassword);
  // Kreiraj novog korisnika
  const user = await User.create({
    first_name,
    last_name,
    email,
    username,
    password: hashedPassword,
    role,
    contact,
    position,
  });

  console.log(`User created: ${user}`);
  //  Ako je korisnik kreiran, vrati status 201 i podatke korisnika
  if (user) {
    res
      .status(201)
      .json({ _id: user._id, email: user.email, username: user.username });
  } else {
    res.status(400);
    throw new Error("User data is not valid!");
  }
});

//@desc Login user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  // Provjeri jesu li svi OBVEZNI podaci uneseni za prijavu (Unos: email ili username i lozinka))
  if ((!email && !username) || !password) {
    res.status(400);
    throw new Error("Email/Username and password are mandatory!");
  }

  let user;
  if (email) {
    user = await User.findOne({ email });
  } else if (username) {
    user = await User.findOne({ username });
  }
  if (!user) {
    res.status(401);
    throw new Error("Invalid email/username!");
  }
  // Usporedi lozinku s hashiranom lozinkom
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password!");
  }
  // Generiraj JWT token
  const accessToken = jwt.sign(
    {
      username: user.username,
      email: user.email,
      id: user.id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  res.status(200).json({ accessToken });
});

//@desc Current user info (User Profile)
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  // Informacije o korisniku dostupne su u `req.user` objektu
  const currentUserData = req.user;
  res.json(currentUserData);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  res.status(200).json(user);
});

//@desc Update user
//@route PUT /api/users/:id
//@access private
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  // Ako nije upisano ostaje prethodna vrijednost
  user.first_name = req.body.first_name || user.first_name;
  user.last_name = req.body.last_name || user.last_name;
  user.email = req.body.email || user.email;
  user.username = req.body.username || user.username;
  user.role = req.body.role || user.role;
  user.contact = req.body.contact || user.contact;
  user.position = req.body.position || user.position;

  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  const updatedUser = await user.save();

  res.status(200).json(updatedUser);
});

//@desc Delete user
//@route DELETE /api/users/:id
//@access private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }
  let deleteUser = await User.findByIdAndDelete(req.params.id);
  res.status(200).json(deleteUser);
});

module.exports = {
  createUser,
  loginUser,
  currentUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
