const express = require("express");
const router = express.Router();

// Home page --> Login page
router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router;
