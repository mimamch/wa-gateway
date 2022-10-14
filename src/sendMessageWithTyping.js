const { delay } = require("@adiwajshing/baileys");

module.exports = sendMessageWTyping = async (jid, msg) => {
  try {
    await sock.presenceSubscribe(jid);
    await delay(500);

    await sock.sendPresenceUpdate("composing", jid);
    await delay(2000);

    await sock.sendPresenceUpdate("paused", jid);

    const res = await sock.sendMessage(jid, msg);
    return res;
  } catch (error) {
    console.log(error);
  }
};
