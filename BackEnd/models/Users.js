const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "First name is required"],
  },
  last_name: {
    type: String,
    required: [true, "Last name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  contact: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: [true, "Role is required"],
  },
});

// Ovo je model koji će se koristiti za rad kolekcijom "users" u bazi podataka
// Ako nismo prethodno stvorili kolekciju "users", MongoDB će je stvoriti
const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel; // Da bi mogli koristiti u drugim datotekama moramo exportati
