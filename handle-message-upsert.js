const { proto } = require("@adiwajshing/baileys");
const fs = require("fs");

/**
 *
 * @param {proto.IWebMessageInfo} msg
 * @param {import("@adiwajshing/baileys").AnyWASocket} session
 */
const handleMessageUpsert = async (session, msg) => {
  try {
    if (msg.key.fromMe) return;
    console.log(msg);
    // if (msg.key.remoteJid == "120363041318010923@g.us") {
    //   session.sendMessage(
    //     msg.key.remoteJid,
    //     {
    //       text: "hai",
    //     },
    //     { quoted: msg }
    //   );
    // }
    if (
      msg.message?.imageMessage?.caption?.toLowerCase().includes(".sticker")
    ) {
      // msg.message?.imageMessage?.
      // console.log(msg.message?.imageMessage.);
      // await session.sendMessage(msg.key.remoteJid, {
      //   sticker: fs.readFileSync("img2.png"),
      //   mimetype: msg.message?.imageMessage?.mimetype,
      // });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = handleMessageUpsert;
