const UserModel = require("../../models/Users");

const saveUserController = async (req, res) => {
  // Preuzeti podatke req.body
  let firstName = req.body.first_name;
  let lastName = req.body.last_name;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let contact = req.body.contact;
  let role = req.body.role;

  // Kreiranje novog korisnika
  let user = new UserModel({
    first_name: firstName,
    last_name: lastName,
    username: username,
    email: email,
    contact: contact,
    password: password,
    role: role,
  });

  try {
    // Spremanje korisnika u bazu podataka
    await user.save();
    res.redirect("/admin");
  } catch (err) {
    // Display error page
    res.send("Korisnik nije kreiran! ", err);
  }
};

module.exports = saveUserController;
