const express = require("express");
const routes = require("./routes");
const connectDB = require("./config/dbConnection");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
/** Middlewares **/
const errorHandler = require("./middleware/errorHandler");
const initializeSocketIO = require("./middleware/socketIOHandler");

/**  Defined PORT (5001) and Connect to Database **/
dotenv.config();
const PORT = process.env.PORT || 5000;
connectDB();

/** Express **/
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

/** Initialize Socket.IO **/
const server = initializeSocketIO(app);

/** Routes **/
app.use("/api", routes);

/** Defined errors **/
app.use(errorHandler);

/** Starting Server **/
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
