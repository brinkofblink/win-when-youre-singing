const httpServer = require("http").createServer();
const path = require("path");
const express = require("express");

// Create Express app for serving static files in production
const app = express();

// Serve static files from dist folder in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "dist")));

  // Serve index.html for all routes (SPA)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
  });
}

// Use Express app with HTTP server
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL || "*"
      : "http://localhost:5173",
  },
});

let currentTrack = 0
const startTimes = []
const buzzes = [[],[],[],[],[],[],[],[],[],[]]
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();


io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  // persist session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // emit session details
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // join the "userID" room
  socket.join(socket.userID);

  // fetch existing users
  const users = [];
  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
    });
  });
  socket.broadcast.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  socket.on("update current track", (track) => {
    currentTrack = track.track
    socket.broadcast.emit("change question", currentTrack)
  });


  socket.on("start track", () => {
    console.log(currentTrack)
    buzzes[currentTrack] = []
    console.log(currentTrack)
    startTimes[currentTrack] = Date.now()
    socket.broadcast.emit("track started")
  });

  socket.on("buzz", () => {
    const now = Date.now()
    const difference = Math.abs(now - startTimes[currentTrack]) / 1000
    buzzes[currentTrack].push({userSessionId: socket.userID, username: socket.username, time: difference.toFixed(2), track: currentTrack})
    socket.to(users[0].userID).emit("buzzes", buzzes);
  });

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userID);
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () =>
  console.log(`server listening at http://localhost:${PORT}`)
);
