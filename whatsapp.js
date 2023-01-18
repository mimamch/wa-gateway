const {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  default: makeWASocket,
  DisconnectReason,
} = require("@adiwajshing/baileys");
const { default: pino } = require("pino/pino");
const fs = require("fs");
const path = require("path");
const { processNumber } = require("./tools");
const { toDataURL } = require("qrcode");
const handleMessageUpsert = require("./handle-message-upsert");
let msgRetryCounterMap = {};

const sessions = new Map();

exports.startWhatsapp = async (name, res, scan) => {
  const logger = pino({ level: "warn" });
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve("credentials", name + "_credentials")
  );
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger,
    qrTimeout: 100000,
    msgRetryCounterMap,
    markOnlineOnConnect: false,
  });
  sessions.set(name, { ...sock });

  sock.ev.process(async (events) => {
    if (events["connection.update"]) {
      const update = events["connection.update"];
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        if (
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut
        ) {
          this.startWhatsapp(name);
        } else {
          this.deleteSession(name);
          //   startSock(name);
        }
      }
      if (connection == "open") {
      }

      console.log("connection update", update);

      if (update.qr && res) {
        const qr = await toDataURL(update.qr);

        if (scan) {
          res.render("scan", { qr: qr });
        } else {
          res.status(200).json({
            qr: qr,
          });
        }
        // return qr;
      }
    }

    // credentials updated -- save them
    if (events["creds.update"]) {
      await saveCreds();
    }
  });
  // sock.ev.on("messages.upsert", (msg) =>
  //   handleMessageUpsert(sock, msg.messages[0])
  // );
};
/**
 * @returns {(import('@adiwajshing/baileys').AnyWASocket|null)}
 */
exports.getSession = (sessionId) => {
  return sessions.get(sessionId) ?? null;
};

exports.deleteSession = (sessionId) => {
  sessions.delete(sessionId);
  const dir = path.resolve("credentials", sessionId + "_credentials");
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
};

/**
 * @param {import('@adiwajshing/baileys').AnyWASocket} session
 */
exports.sendMessageText = async (session, receiver, message) => {
  try {
    return await session.sendMessage(receiver, {
      text: message,
    });
  } catch (error) {
    return Promise.reject(error); // eslint-disable-line prefer-promise-reject-errors
  }
};

exports.isNumberExist = async (session, receiver, isGroup) => {
  try {
    let result;

    if (isGroup) {
      result = await session.groupMetadata(receiver);

      return Boolean(result.id);
    }

    [result] = await session.onWhatsApp(receiver);

    return result.exists;
  } catch (error) {
    return false;
  }
};

exports.getSessionList = () => {
  return Array.from(sessions.keys());
};

/**
 * @param {import('@adiwajshing/baileys').AnyWASocket} session
 */
exports.sendSticker = async (session, { receiver, sticker }) => {
  return session.sendMessage(receiver, {
    sticker: "https://placehold.jp/150x150.png",
  });
};

exports.init = () => {
  if (!fs.existsSync(path.resolve("credentials"))) {
    fs.mkdirSync(path.resolve("credentials"));
  }
  fs.readdir(path.resolve("credentials"), async (err, files) => {
    if (err) {
      throw err;
    }

    for (const file of files) {
      this.startWhatsapp(file.split("_")[0]);
    }
  });
};

this.init();
