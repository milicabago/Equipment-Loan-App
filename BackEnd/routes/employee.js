const express = require("express");
const router = express.Router();

// Middleware
router.use(checkOperater);

// Show Home page for employee
router.get("/", require("../controllers/employee/employeeController"));

// router.post(
//   "/newTermin",
//   require("../controllers/operater/newTerminController")
// );

function checkOperater(req, res, next) {
  let user = req.session.user;

  if (user) {
    if (user.role === "employee") {
      next();
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
}

module.exports = router;
