const { Configuration, OpenAIApi } = require("openai");
const { CommandProcessor } = require("@mimamch/cmd");
const wa = require("wa-multi-session");
const getMessageCaption = require("../../utils/get-caption");

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

exports.init = ({ app, whatsapp }) => {
  app.get("/hello", (req, res) => {
    res.send("hello");
  });
  configureWa(whatsapp);
};

/**
 * @param {(import ('wa-multi-session'))} whatsapp
 */
const configureWa = (whatsapp) => {
  whatsapp.onMessageReceived((msg) => {
    handleGPT(whatsapp, msg);
  });
};

let onlineAt = new Date();
let maxChatSaved = 15;
let listMessage = {};
const allowedSender = ["85838707828"];

const clearMessage = (id) => {
  listMessage[id] = listMessage[id].slice(-maxChatSaved);
};

/**
 * @param {(import ('wa-multi-session'))} whatsapp
 * @param {(import ('wa-multi-session').MessageReceived)} msg
 */
const handleGPT = async (whatsapp, msg) => {
  try {
    const sender = msg.key.remoteJid;
    const allowed = allowedSender.some((val) => sender.includes(val));
    if (!allowed || msg.key.fromMe) return;

    const caption = getMessageCaption(msg);

    if (caption.startsWith("/")) {
      return handleCommand(msg);
    }

    await whatsapp.readMessage({ sessionId: msg.sessionId, key: msg.key });
    whatsapp
      .sendTyping({
        sessionId: msg.sessionId,
        duration: 5000,
        to: msg.key.remoteJid,
      })
      .catch(() => {});

    if (!(sender in listMessage)) {
      listMessage[sender] = [];
    }

    listMessage[sender].push({
      role: "user",
      content: caption,
    });

    const res = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: listMessage[sender],
      temperature: 0,
      //   max_tokens: 30,
    });
    const responseMsg = res.data.choices[0].message;
    listMessage[sender].push(responseMsg);

    await whatsapp.sendTextMessage({
      sessionId: msg.sessionId,
      to: sender,
      answering: msg,
      text: responseMsg.content,
    });
    clearMessage(sender);
  } catch (error) {
    whatsapp
      .sendTextMessage({
        sessionId: msg.sessionId,
        to: msg.key.remoteJid,
        answering: msg,
        text: "Upsss, Terjadi Masalah Pada CHATGPT",
      })
      .catch(() => {});
    clearMessage(sender);
  }
};

const commander = new CommandProcessor({
  "/clear-chat": () => {
    listMessage = {};
    return "Chat Cleared";
  },
  "/add-allowed": (params) => {
    if (Array.isArray(params)) {
      console.log(params);
      params.map((e) => {
        if (typeof e == "string") {
          allowedSender.push(e);
        }
      });
      return allowedSender;
    }
  },
  "/get-allowed": () => {
    return allowedSender;
  },
  "/set-maxsaved": (params) => {
    if (Array.isArray(params)) {
      maxChatSaved = Number(params[0] ?? maxChatSaved);
      return `Max Chat Saved : ${maxChatSaved}`;
    }
  },
  "/status": () => {
    return `System Online Since : ${onlineAt}`;
  },
});

const handleCommand = async (msg) => {
  try {
    const caption = getMessageCaption(msg).split(" ");
    const res = await commander.parseCommand(caption[0], ...caption.slice(1));
    if (res) {
      wa.sendTextMessage({
        sessionId: msg.sessionId,
        to: msg.key.remoteJid,
        answering: msg,
        text: res.toString(),
      }).catch(() => {});
    }
  } catch (error) {
    console.log(error.message);
  }
};
