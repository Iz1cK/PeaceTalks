const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const router = require("./router");
const socketIo = require("socket.io");
const { v4: uuidV4 } = require("uuid");
const usersController = require("./models/users.model");
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

app.get("/index", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/site-services", (req, res) => {
  res.sendFile(__dirname + "/public/siteServices.html");
});

app.get("/login-home", (req, res) => {
  res.sendFile(__dirname + "/public/loginHome.html");
});

app.get("/create", (req, res) => {
  res.render("createRoom.ejs");
});

app.get("/create-link", (req, res) => {
  let roomId = uuidV4();
  let data = {
    success: true,
    link: `http://localhost:2312/room/${roomId}`,
  };
  res.send(data);
});

app.get("/contact", (req, res) => {
  res.sendFile(__dirname + "/public/contact.html");
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
  socket.on("join-room", (roomId, data) => {
    currentRoom = roomId;
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", data);

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

  socket.on("language-changed", (data) => {
    console.log(data);
    socket.to(currentRoom).emit("language-changed", {
      userId: data.userId,
      language: data.language,
    });
  });

  socket.on("translation", (data) => {
    console.log(data);
    socket.to(currentRoom).emit("translation", {
      userId: data.userId,
      translation: data.translation,
      audioBase64: data.audioBase64,
    });
  });
});
