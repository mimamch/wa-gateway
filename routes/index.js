var express = require("express");
const { processNumber } = require("../tools");
const createDelay = require("../utils/create-delay");
const sendBulkMessageDelay = require("../utils/send-bulk-message-delay");
const {
  isNumberExist,
  sendMessageText,
  getSession,
  startWhatsapp,
} = require("../whatsapp");
var router = express.Router();

router.use("/start-session", async (req, res) => {
  try {
    const sessionName = req.body.name || req.query.name || req.headers.name;
    if (!sessionName) {
      throw new Error("Bad Request");
    }
    if (getSession(sessionName)) {
      throw new Error("Session is Exist");
    }
    startWhatsapp(sessionName, res, req.query.scan || req.body.scan);
  } catch (error) {
    // console.log(error);
    res.status(400).json({
      status: false,
      data: {
        error: error.message,
      },
    });
  }
});
router.use("/delete-session", async (req, res) => {
  try {
    const sessionName = req.body.name || req.query.name || req.headers.name;
    res.status(200).json({
      status: true,
      data: {
        message: "Success Deleted " + sessionName,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      data: {
        error: error.message,
      },
    });
  }
});
router.use("/send-message", async (req, res) => {
  try {
    let to = req.body.to || req.query.to,
      text = req.body.text || req.query.text;

    let isGroup = req.body.isGroup || req.query.isGroup;

    if (!to)
      return res.status(400).json({
        status: false,
        data: {
          error: "Bad Request",
        },
      });
    if (!to || !text)
      throw new Error("Tujuan dan Pesan Kosong atau Tidak Sesuai");

    const receiver = processNumber(to);
    const session = getSession(
      req.body.session || req.query.session || req.headers.session || "mimamch"
    );
    if (!session) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Session Not Found",
        },
      });
    }
    if (!(await isNumberExist(session, receiver))) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Not Registered On WhatsApp",
        },
      });
    }

    const send = await sendMessageText(session, receiver, text);

    res.status(200).json({
      status: true,
      data: {
        id: send?.key?.id,
        status: send?.status,
        message: send?.message?.extendedTextMessage?.text || "Not Text",
        remoteJid: send?.key?.remoteJid,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      data: {
        error: error.message,
      },
    });
  }
});
router.use("/send-bulk-message", async (req, res) => {
  try {
    const session = getSession(
      req.body.session || req.query.session || req.headers.session || "mimamch"
    );
    if (!session) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Session Not Found",
        },
      });
    }
    sendBulkMessageDelay({
      data: req.body.data,
      session,
      delay: parseInt(req.body.delay ?? 5000),
    });

    res.status(200).json({
      status: true,
      data: {
        message: "Bulk Message is Processing",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      data: {
        error: error.message,
      },
    });
  }
});

module.exports = router;
