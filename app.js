var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const { startSock } = require("./baileys/new");
const { socketConnection } = require("./src/socket-io");
const { processNumber } = require("./tools");
var queue = require("queue");
const fs = require("fs");
var app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
let isWaActive = global.sock || false;
// setTimeout(() => {
//   const dir = path.resolve(__dirname, "baileys_auth_info");
//   if (!fs.existsSync(dir)) return;
//   global.sock ? (isWaActive = global.sock) : null;
//   if (isWaActive) return;
//   startSock();
// }, 1000);

app.use("/up", async (req, res) => {
  // io.emit("qr", { data: "ini up" });
  global.sock ? (isWaActive = global.sock) : null;
  if (isWaActive)
    return res.json({
      msg: "Service is Already Online",
    });
  const data = await startSock();
  // if (data) isWaActive = true;
  res.render("index", { title: "Home" });
});

// DEFINE QUEUE
const q = queue({ concurrency: 1, autostart: true });
q.on("error", (err) => console.log("ERROR QUEUE> ", err));
q.on("timeout", function (next, job) {
  console.log("JOB TIME OUT");
  next();
});
q.on("success", function (result, job) {
  console.log("SUKSES ALL");
});

app.use("/send-message-queue-button-link", async (req, res) => {
  try {
    let to = req.body.to || req.query.to || "";
    let text = req.body.text || req.query.text || "";
    let buttonText = req.body.buttonText || req.query.buttonText || "";
    let buttonLink = req.body.buttonLink || req.query.buttonLink || "";

    if (!to || !text || !buttonText || !buttonLink)
      throw new Error("Data Kosong atau Tidak Sesuai");
    to = processNumber(to);
    if (!global.sock)
      return res.status(401).json({ msg: "System is Not Ready" });

    console.log("ADDED TO QUEUE>", req.body);

    const templateButtons = [
      {
        index: 1,
        urlButton: {
          displayText: buttonText,
          url: buttonLink,
        },
      },
    ];

    const templateMessage = {
      text: text,
      templateButtons: templateButtons,
    };
    // q.push(function (cb) {
    //   (async () => {
    //     const [result] = await sock.onWhatsApp(to.split("@s.whatsapp.net")[0]);
    //     if (!result) {
    //       return cb(null, "NOT REGISTERED");
    //     }
    //   })();
    //   setTimeout(async function () {
    //     const send = await sock.sendMessage(to, templateMessage);
    //     cb();
    //   }, Number(process.env.QUEUE_TIMEOUT || 500));
    // });
    const [result] = await sock.onWhatsApp(to.split("@s.whatsapp.net")[0]);
    if (!result) {
      return cb(null, "NOT REGISTERED");
    }
    await sock.sendMessage(to, templateMessage);

    res.status(200).json({
      status: true,
      data: {
        message: "Success",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

app.use("/send-message-queue", async (req, res) => {
  try {
    let to = req.body.to || req.query.to,
      text = req.body.text || req.query.text;

    if (!to || !text)
      throw new Error("Tujuan dan Pesan Kosong atau Tidak Sesuai");
    to = processNumber(to);
    if (!global.sock)
      return res.status(401).json({ msg: "System is Not Ready" });

    q.push(function (cb) {
      (async () => {
        const [result] = await sock.onWhatsApp(to.split("@s.whatsapp.net")[0]);
        if (!result) {
          return cb(null, "NOT REGISTERED");
        }
      })();
      setTimeout(async function () {
        const send = await sock.sendMessage(to, {
          text: text,
        });
        cb();
      }, Number(process.env.QUEUE_TIMEOUT || 1000));
    });

    res.status(200).json({
      status: true,
      data: {
        message: "Added to Queue",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      data: {
        error: error.message,
      },
    });
  }
});

app.use("/", require("./routes/index"));

app.use("/send-message", async (req, res) => {
  try {
    let to = req.body.to || req.query.to,
      text = req.body.text || req.query.text;

    let isGroup = req.body.isGroup || req.query.isGroup;

    if (!to)
      return res.status(400).json({
        status: false,
        data: {
          error: "Bad Request",
        },
      });
    to = !isGroup ? processNumber(to) : to;
    if (!global.sock)
      return res.status(401).json({ msg: "System is Not Ready" });
    // const [result] = await sock.onWhatsApp(to.split("@s.whatsapp.net")[0]);
    // if (!result)
    //   return res
    //     .status(401)
    //     .json({ msg: "Number is Not Registered as WhatsApp Number" });

    if (!to || !text)
      throw new Error("Tujuan dan Pesan Kosong atau Tidak Sesuai");

    const [result] = !isGroup
      ? await sock.onWhatsApp(to.split("@s.whatsapp.net")[0])
      : [true];
    if (!result) {
      return res.status(500).json({
        status: false,
        data: {
          error: "Not Registered On WhatsApp",
        },
      });
    }

    const send = await sock.sendMessage(to, {
      text: text,
    });

    res.status(200).json({
      status: true,
      data: {
        id: send?.key.id,
        status: send?.status,
        message: send?.message?.extendedTextMessage?.text || "Not Text",
        remoteJid: send.key.remoteJid,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      data: {
        error: error.message,
      },
    });
  }
});

app.use("/get-all-group", async (req, res) => {
  try {
    let getGroups = await sock.groupFetchAllParticipating();
    console.log(getGroups);
    let groups = Object.entries(getGroups)
      .slice(0)
      .map((entry) => entry[1]);
    console.log(groups);
    res.json(groups);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      data: {
        error: error.message,
      },
    });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  return res.status(404).json({
    status: false,
    data: {
      error: "route not found",
    },
  });
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// startSock();

var debug = require("debug")("baileys:server");
var http = require("http");
const { checkKataKasar } = require("./utils/group-response");
const { getSession, sendMessageText } = require("./whatsapp");

var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

var server = http.createServer(app);
socketConnection(server);

// const { Server } = require("socket.io");

// const io = new Server(server);
// io.on("connection", (socket) => {
//   setInterval(() => {
//     socket.emit("qr", { data: "sss" });
//   }, 1000);
// });

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }
  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}
function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
module.exports = app;
