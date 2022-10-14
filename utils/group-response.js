const fs = require("fs");
const path = require("path");
const filePath = path.resolve(__dirname, "../", "public/kata-kasar.json");
fs.existsSync(filePath)
  ? null
  : fs.writeFileSync(filePath, JSON.stringify([]), "utf8");

exports.checkKataKasar = async (sock) => {
  try {
    sock.ev.process(async (events) => {
      try {
        if (events["messages.upsert"]) {
          const upsert = events["messages.upsert"];
          if (upsert.type === "notify") {
            for (const msg of upsert.messages) {
              if (msg.key?.participant) {
                const kataKasar = JSON.parse(fs.readFileSync(filePath));
                //   console.log(msg);
                const message =
                  msg.message?.conversation ||
                  msg.message?.extendedTextMessage?.text ||
                  "";
                if (message == "#kasar") {
                  console.log("ADDED TO KAMUS KASAR");
                  return this.addKataKasar(
                    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
                      ?.conversation
                  );
                }

                const check = message.split(" ").some((text) => {
                  return kataKasar.includes(text.toLowerCase());
                });
                if (check) {
                  await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                      text: "Kamu Jangan Toxic Gitu Dong!",
                    },
                    {
                      quoted: msg,
                    }
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

exports.addKataKasar = async (msg) => {
  try {
    if (!msg) return false;
    msg = msg.toLowerCase();
    const kataKasar = JSON.parse(fs.readFileSync(filePath));
    if (kataKasar.includes(msg)) return false;
    console.log(msg);
    fs.writeFileSync(
      filePath,
      JSON.stringify([...kataKasar, msg]),
      "utf8",
      (err, data) => {
        if (err) console.log(err);
        console.log(data);
      }
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
