const EquipmentModel = require("../../models/Equipments");

const saveEquipmentController = async (req, res) => {
  // Preuzeti podatke req.body
  let name = req.body.name;
  let full_name = req.body.full_name;
  let serialNumber = req.body.serial_number;
  let condition = req.body.condition;
  let description = req.body.description;

  // Kreiranje opreme
  let equipment = new EquipmentModel({
    name: name,
    full_name: full_name,
    serial_number: serialNumber,
    condition: condition,
    description: description,
  });

  try {
    // Spremanje opreme u bazu podataka
    await equipment.save();
    res.redirect("/admin");
  } catch (err) {
    // Display error page
    res.send("Oprema nije dodana! ", err);
  }
};

module.exports = saveEquipmentController;
