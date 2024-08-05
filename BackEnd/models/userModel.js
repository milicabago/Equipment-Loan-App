const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
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
    position: {
      type: String,
      required: [true, "Position is required"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// If the "users" collection was not previously created, MongoDB will create it
const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
