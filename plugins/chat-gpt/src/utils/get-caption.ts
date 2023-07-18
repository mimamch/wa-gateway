import * as wa from "wa-multi-session";
const getMessageCaption = (msg: wa.MessageReceived) => {
  return (
    msg.message?.conversation ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    msg.message?.documentMessage?.caption ||
    msg.message?.extendedTextMessage?.text ||
    ""
  );
};

export default getMessageCaption;
