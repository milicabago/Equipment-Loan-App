const express = require("express");
const routes = require("./routes");
const connectDB = require("./config/dbConnection");
const dotenv = require("dotenv");
const cors = require("cors");
const cookeParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");

/**  Defined PORT (5001) and Connect to Database **/
dotenv.config();
const PORT = process.env.PORT || 5000;
connectDB();

const app = express();
app.use(express.json());
app.use(cookeParser());
app.use(cors());

/** Routes **/
app.use("/api", routes);

/** Defined errors **/
app.use(errorHandler);

/**  Starting Server **/
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
