const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const router = require("./router");
const socketIo = require("socket.io");
const { v4: uuidV4 } = require("uuid");
// import cron from "./utils/cron";
const { errorConverter, errorHandler } = require("./middlewares/error");

const app = express();
const port = process.env.PORT || 2312;
const corsObj = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
};

app.use(cors(corsObj));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/room/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

app.get("/room", (req, res) => {
  res.redirect(`/room/${uuidV4()}`);
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.use("/api", router);

app.use(errorConverter);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} `);
});

const io = socketIo(server, { ...corsObj });

io.on("connection", (socket) => {
  let currentRoom = null;
  socket.on("join-room", (roomId, signalData) => {
    currentRoom = roomId;
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", signalData);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected");
    });
  });

  socket.on("camera-toggled", (data) => {
    console.log(data);
    socket.to(currentRoom).emit("camera-toggled", {
      userId: data.userId,
      cameraActive: data.cameraActive,
    });
  });
});
