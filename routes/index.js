var express = require("express");
const { processNumber } = require("../utils/process-number");
const createDelay = require("../utils/create-delay");
const whatsapp = require("wa-multi-session");
const { toDataURL } = require("qrcode");
var router = express.Router();

/**
  @param {import('express').Request} req
  @param {import('express').Response} res
 */

router.use("/start-session", async (req, res) => {
  try {
    const scan = req.query.scan;
    const sessionName =
      req.body.session || req.query.session || req.headers.session;
    if (!sessionName) {
      throw new Error("Bad Request");
    }
    whatsapp.onQRUpdated(async (data) => {
      if (res && !res.headersSent) {
        const qr = await toDataURL(data.qr);
        if (scan && data.sessionId == sessionName) {
          res.render("scan", { qr: qr });
        } else {
          res.status(200).json({
            qr: qr,
          });
        }
      }
    });
    await whatsapp.startSession(sessionName, { printQR: true });
  } catch (error) {
    // console.log(error);
    res.status(400).json({
      status: false,
      data: {
        error: error?.message,
      },
    });
  }
});
router.use("/delete-session", async (req, res) => {
  try {
    const sessionName =
      req.body.session || req.query.session || req.headers.session;
    if (!sessionName) {
      throw new Error("Bad Request");
    }
    whatsapp.deleteSession(sessionName);
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
        error: error?.message,
      },
    });
  }
});
router.use("/send-message", async (req, res) => {
  try {
    let to = req.body.to || req.query.to,
      text = req.body.text || req.query.text;
    let isGroup = req.body.isGroup || req.query.isGroup;
    console.log(
      "message send from >",
      req.headers["x-forwarded-for"] || req.socket.remoteAddress
    );
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
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
    if (!sessionId)
      return res.status(400).json({
        status: false,
        data: {
          error: "Session Not Found",
        },
      });

    const send = await whatsapp.sendTextMessage({
      sessionId,
      to: receiver,
      text,
    });

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
        error: error?.message,
      },
    });
  }
});
router.use("/send-bulk-message", async (req, res) => {
  try {
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
    if (!sessionId) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Session Not Found",
        },
      });
    }
    for (const dt of req.body.data) {
      await createDelay(delay);
      await whatsapp.sendTextMessage({
        sessionId,
        to: processNumber(dt.to),
        text: dt.text,
      });
    }
    console.log("SEND BULK MESSAGE WITH DELAY SUCCESS");

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
        error: error?.message,
      },
    });
  }
});
router.use("/sessions", async (req, res) => {
  try {
    const sessions = whatsapp.getAllSession();
    res.status(200).json({
      status: true,
      data: {
        sessions,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      data: {
        error: error?.message,
      },
    });
  }
});

module.exports = router;
