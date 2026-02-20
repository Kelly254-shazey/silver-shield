const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const env = require("./env");
const realtime = require("../services/realtimeService");

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.frontendUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const authHeader = socket.handshake.auth?.token || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      socket.data.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      socket.data.user = decoded;
    } catch {
      socket.data.user = null;
    }

    return next();
  });

  io.on("connection", (socket) => {
    const role = socket.data.user?.role;
    if (role === "admin") {
      socket.join("admin");
    }

    socket.on("subscribe:donation", (donationId) => {
      if (!donationId) {
        return;
      }
      socket.join(`donation:${donationId}`);
    });

    socket.on("subscribe:admin", () => {
      if (role === "admin") {
        socket.join("admin");
      }
    });
  });

  realtime.setIO(io);
  return io;
}

module.exports = {
  initSocket,
};
