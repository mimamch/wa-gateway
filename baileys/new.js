const baileys = require("@adiwajshing/baileys");
const socketio = require("socket.io");
const path = require("path");
const fs = require("fs");
const {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useMultiFileAuthState,
} = baileys;
const makeWASocket = baileys.default;
const MAIN_LOGGER = require("../src/logger");
const { getRooms, sendQR } = require("../src/socket-io");
const logger = MAIN_LOGGER.child({});
logger.level = "warn";
const qrcode = require("qrcode");
const useStore = !process.argv.includes("--no-store");

const msgRetryCounterMap = {};

const store = useStore ? makeInMemoryStore({ logger }) : undefined;

// start a connection
const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth_info");
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

  global.sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: state,
    msgRetryCounterMap,
    markOnlineOnConnect: false,
  });

  // the process function lets you process all events that just occurred
  // efficiently in a batch
  sock.ev.process(
    // events is a map for event name => event data
    async (events) => {
      // something about the connection changed
      // maybe it closed, or we received all offline message or connection opened
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect, qr } = update;
        const fileName = "qr.png";

        const qrpath = path.resolve(__dirname, "../public/qr");
        if (!fs.existsSync(qrpath)) fs.mkdirSync(qrpath);
        if (qr) {
          //   const fileName = "qr" + new Date().getTime() + ".png";
          const fileName = `qr-${new Date().getTime()}.png`;

          const qrpathimage = path.resolve(__dirname, "../public/qr", fileName);
          if (fs.existsSync(qrpath)) {
            fs.readdir(path.resolve(qrpath), (err, files) => {
              if (err) throw err;

              for (const file of files) {
                fs.unlink(path.join(path.resolve(qrpath), file), (err) => {
                  if (err) throw err;
                });
              }
            });
          }

          qrcode.toFile(qrpathimage, qr);

          sendQR(getRooms()[0], "qr", {
            status: "close",
            qr: qr,
            fileName: fileName,
          });
          console.log(getRooms());
        }
        if (connection === "close") {
          // reconnect if not logged out
          if (
            lastDisconnect?.error?.output?.statusCode !==
            DisconnectReason.loggedOut
          ) {
            startSock();
          } else {
            console.log("Connection closed. You are logged out.");
            const dir = path.resolve(__dirname, "../", "baileys_auth_info");
            if (fs.existsSync(dir)) {
              fs.rmdirSync(dir, { recursive: true });
            }
            startSock();
          }
        }
        if (connection == "open") {
          sendQR(getRooms()[0], "qr", { status: "open" });
          fs.readdir(path.resolve(qrpath), (err, files) => {
            if (err) throw err;

            for (const file of files) {
              fs.unlink(path.join(path.resolve(qrpath), file), (err) => {
                if (err) throw err;
              });
            }
          });
        }

        console.log("connection update", update);
      }

      // credentials updated -- save them
      if (events["creds.update"]) {
        await saveCreds();
      }
    }
  );

  return sock;
};

module.exports = { startSock };
