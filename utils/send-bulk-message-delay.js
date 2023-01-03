const { processNumber } = require("../tools");
const { sendMessageText } = require("../whatsapp");
const createDelay = require("./create-delay");

module.exports = sendBulkMessageDelay = async ({
  data,
  delay = 5000,
  session,
}) => {
  try {
    for (const dt of data) {
      await createDelay(delay);
      await sendMessageText(session, processNumber(dt.to), dt.text);
    }
    console.log("SEND BULK MESSAGE WITH DELAY SUCCESS");
  } catch (error) {
    console.log(error);
  }
};
