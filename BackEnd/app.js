const express = require("express");
const app = express();
const routes = require("./routes");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");

// Models
const UserModel = require("./models/Users");
const EquipmentModel = require("./models/Equipments");

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://dklaric00:gs2024db@cluster0.0arnl28.mongodb.net/equipment_loan_app?retryWrites=true&w=majority&appName=Cluster0"
);

const HALF_DAY = 1000 * 60 * 60 * 12; // 12 hours

const {
  PORT = 3001,
  NODE_ENV = "development",
  SESS_NAME = "sid",
  SESS_SECRET = "equipment_loan_app",
  SESS_LIFETIME = HALF_DAY,
} = process.env;

const IN_PROD = NODE_ENV === "production"; // true ako je NODE_ENV = "production", ali znamo da je false

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(
  session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
      maxAge: SESS_LIFETIME,
      sameSite: true,
      secret: IN_PROD, // true za HTTPS protokol - lokalno ne koristimo HTTPS, pa je false
    },
  })
);

// Za prikaz podataka koristm view engine EJS
app.set("view engine", "ejs");
app.use("/", routes);

// DODANO
// app.post("/createUser", async (req, res) => {
//   const user = req.body;
//   const newUser = new UserModel(user);
//   await newUser.save();

//   res.json(user);
// });

// DODANO
app.post("/createEquipment", async (req, res) => {
  const equipment = req.body;
  const newEquipment = new EquipmentModel(equipment);
  await newEquipment.save();

  res.json(equipment);
});

// React pokrećemo na 3000, a server na 3001 portu
app.listen(PORT, () => {
  console.log("Listening on port 3001");
});
