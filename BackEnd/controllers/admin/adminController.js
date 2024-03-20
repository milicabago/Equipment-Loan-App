const UserModel = require("../../models/Users");
const EquipmentModel = require("../../models/Equipments");

const adminController = async (req, res) => {
  try {
    let user = req.session.user;
    let users = await UserModel.find({});
    let equipments = await EquipmentModel.find({});

    let employees = users.filter((user) => user.role === "employee");

    res.render("admin/adminDashboard", {
      name: user.first_name + " " + user.last_name,
      employees: employees,
      equipments: equipments,
      role: user.role,
    });
  } catch (error) {
    console.error("Greška prilikom dohvaćanja podataka iz baze: ", error);
    res.redirect("/");
  }
};

module.exports = adminController;
