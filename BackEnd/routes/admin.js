const express = require("express");
const router = express.Router();
// Middleware
router.use(checkAdmin);

// ADMIN
router.get("/", require("../controllers/admin/adminController"));

// CREATE & SAVE USER
router.get("/createUser", (req, res) => {
  // Provjeri da li je korisnik prijavljen
  if (req.session && req.session.user) {
    // Dohvati ime i prezime korisnika iz sesije
    let { first_name, last_name } = req.session.user;
    let name = first_name + " " + last_name;
    let role = req.session.user.role;

    // Renderiraj stranicu createUser s podacima o korisniku
    res.render("admin/createUser", {
      name: name,
      role: role,
    });
  }
});
router.post(
  "/createUser/saveUser",
  require("../controllers/admin/saveUserController")
);

// CREATE & SAVE EQUIPMENT
router.get("/createEquipment", (req, res) => {
  if (req.session && req.session.user) {
    // Dohvati ime i prezime korisnika iz sesije
    let { first_name, last_name } = req.session.user;
    let name = first_name + " " + last_name;
    let role = req.session.user.role;

    // Renderiraj stranicu createUser s podacima o korisniku
    res.render("admin/createEquipment", {
      name: name,
      role: role,
    });
  }
});
router.post(
  "/createEquipment/saveEquipment",
  require("../controllers/admin/saveEquipmentController")
);

/*
// GRAD
router.get("/create/grad", (req, res) => {
  res.render("admin/createGrad");
});
router.post("/create/grad/save", require("../controllers/admin/createGrad"));

// PROIZVOD
router.get("/create/proizvod", (req, res) => {
  res.render("admin/createProizvod");
});
router.post(
  "/create/proizvod/save",
  require("../controllers/admin/createProizvod")
);

// DELETE USER
router.get(
  "/delete/user/:userId",
  require("../controllers/admin/deleteUserController")
);

// DELETE PROIZVOD
router.get(
  "/delete/proizvod/:proizvodId",
  require("../controllers/admin/deleteProizvodController")
);

// DELETE GRAD
router.get(
  "/delete/grad/:gradId",
  require("../controllers/admin/deleteGradController")
);

// Savjetnik
router.get(
  "/savjetnik/termini/:name",
  require("../controllers/admin/savjetnikTerminiController")
);
*/
function checkAdmin(req, res, next) {
  let user = req.session.user;
  if (user) {
    if (user.role === "admin") {
      next();
    } else {
      // Ako korisnik nije admin --> redirektaj na login
      res.redirect("/");
    }
  } else {
    // Ako korisnik nije prijavljen --> redirektaj na login
    res.redirect("/");
  }
}

module.exports = router;
