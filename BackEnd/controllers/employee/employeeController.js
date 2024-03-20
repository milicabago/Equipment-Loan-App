const EquipmentModel = require("../../models/Equipments");

const employeeController = async (req, res) => {
  try {
    let user = req.session.user;

    let equipments = await EquipmentModel.find({});

    res.render("employee/index", {
      name: user.first_name + " " + user.last_name,
      role: user.role,
      equipments: equipments,
    });
  } catch (error) {
    console.error("Greška prilikom dohvaćanja podataka iz baze: ", error);
    res.redirect("/");
  }
};

module.exports = employeeController;
