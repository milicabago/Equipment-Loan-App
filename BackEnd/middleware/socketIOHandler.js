const socketIo = require("socket.io");
const http = require("http");

const initializeSocketIO = (app) => {
    const server = http.createServer(app);
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:3000", // FrontEnd URL
        },
    });

    // Middleware req.io for all routes
    app.use((req, res, next) => {
        req.io = io;
        next();
    });

    // Socket.IO connection
    io.on("connection", (socket) => {
        const { user_id } = socket.handshake.query;
        console.log(`Connected user ID: ${user_id}`);

        if (user_id) {
            socket.join(user_id);  // User joins the room with user_id identifier
        }

        socket.on("disconnect", () => {
            if (user_id) {
                socket.leave(user_id);
            }
            console.log(`User with ID '${user_id || "undefined"}' disconnected.`);
        });
    });

    return server;
};

module.exports = initializeSocketIO;
