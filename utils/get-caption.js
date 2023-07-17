const getMessageCaption = (msg) => {
  return (
    msg.message?.conversation ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    msg.message?.documentMessage?.caption ||
    msg.message?.extendedTextMessage?.text ||
    ""
  );
};

module.exports = getMessageCaption;
