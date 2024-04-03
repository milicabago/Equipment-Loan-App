const express = require("express");
// const routes = require("./routes");
const connectDB = require("./config/dbConnection");
const dotenv = require("dotenv").config();
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const port = process.env.PORT || 5000;

connectDB();
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors());

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
