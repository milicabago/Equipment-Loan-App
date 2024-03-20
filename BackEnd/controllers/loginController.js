const UserModel = require("../models/Users");

const loginController = async (req, res) => {
  // Preuzeti podatke req.body iz forme
  let usernameOrEmailForm = req.body.usernameOrEmail;
  let passwordForm = req.body.password;

  try {
    // Dohvacanje korisnika iz baze pomocu Mongoose
    // findOne() - dohvati prvog korisnika koji zadovoljava uvjete
    const user = await UserModel.findOne({
      $or: [{ email: usernameOrEmailForm }, { username: usernameOrEmailForm }],
      password: passwordForm,
    });

    if (user) {
      // Ako je PRONADJEN KORISNIK
      req.session.user = user; // Postavljanje sesije za prijavljenog korisnika

      // Provjera role
      if (user.role === "admin") {
        res.redirect("/admin");
      } else if (user.role === "employee") {
        res.redirect("/employee");
      } else {
        res.redirect("/");
      }
    } else {
      // Ako korisnik NIJE PRONADJEN
      res.redirect("/");
    }
  } catch (error) {
    console.error("Greška prilikom dohvaćanja podataka iz baze: ", error);
    res.redirect("/");
  }
};

module.exports = loginController;
