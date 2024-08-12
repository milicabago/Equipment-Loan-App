const express = require("express");
const routes = require("./routes");
const connectDB = require("./config/dbConnection");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
/** Notifications **/
const http = require("http");
const socketIo = require("socket.io");

/**  Defined PORT (5001) and Connect to Database **/
dotenv.config();
const PORT = process.env.PORT || 5000;
connectDB();

/** Express **/
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

/** Routes **/
app.use("/api", routes);

/** Defined errors **/
app.use(errorHandler);

/** Socket.io -- START → **/

/** Kreiranje HTTP servera za Socket.IO **/
const server = http.createServer(app);

/** Inicijalizacija Socket.IO instance **/
const io = socketIo(server, {
  cors: {
    origin: "*", // Omogući CORS za sve domene
    methods: ["GET", "POST"], // Omogući GET i POST metode
  },
});

/** Middleware za omogućavanje Socket.IO pristupa u rutama **/
app.use((req, res, next) => {
  req.io = io; // Dodaj instancu Socket.IO u zahtjev (req)
  next();
});

/** Socket.IO događaji za upravljanje vezama korisnika **/
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

/** ← END -- Socket.io **/

/** Starting Server **/
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});