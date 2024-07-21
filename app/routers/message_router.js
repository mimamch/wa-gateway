const { Router } = require("express");
const {
  sendMessage,
  sendBulkMessage,
  sendImageMessage
} = require("../controllers/message_controller");
const MessageRouter = Router();

MessageRouter.all("/send-message", sendMessage);
MessageRouter.all("/send-bulk-message", sendBulkMessage);
MessageRouter.all("/send-image", sendImageMessage);

module.exports = MessageRouter;
