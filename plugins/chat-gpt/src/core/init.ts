import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { CommandProcessor } from "@mimamch/cmd";
import wa from "wa-multi-session";
import { Express } from "express";
import getMessageCaption from "../utils/get-caption";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export const init = ({
  app,
  whatsapp,
}: {
  app: Express;
  whatsapp: typeof wa;
}) => {
  app.get("/hello", (req, res) => {
    res.send("hello");
  });
  configureWa(whatsapp);
};

/**
 * @param {(import ('wa-multi-session'))} whatsapp
 */
const configureWa = (whatsapp: typeof wa) => {
  whatsapp.onMessageReceived((msg) => {
    handleGPT(whatsapp, msg);
  });
};

let onlineAt = new Date();
let maxChatSaved = 15;

interface ListMessage {
  [key: string]: ChatCompletionRequestMessage[];
}

let listMessage: ListMessage = {};
const allowedSender = ["85838707828"];

const clearMessage = (id: string) => {
  listMessage[id] = listMessage[id].slice(-maxChatSaved);
};

/**
 * @param {(import ('wa-multi-session'))} whatsapp
 * @param {(import ('wa-multi-session').MessageReceived)} msg
 */
const handleGPT = async (whatsapp: typeof wa, msg: wa.MessageReceived) => {
  const sender = msg.key.remoteJid!;
  try {
    const allowed = allowedSender.some((val) => sender.includes(val));
    if (!allowed || msg.key.fromMe) return;

    const caption = getMessageCaption(msg);

    if (caption.startsWith("/")) {
      return handleCommand(whatsapp, msg);
    }

    await whatsapp.readMessage({ sessionId: msg.sessionId, key: msg.key });
    whatsapp
      .sendTyping({
        sessionId: msg.sessionId,
        duration: 5000,
        to: msg.key.remoteJid!,
      })
      .catch(() => {});

    if (!(sender in listMessage)) {
      listMessage[sender!] = [];
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
    const responseMsg = res.data.choices[0].message!;
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
        to: msg.key.remoteJid!,
        answering: msg,
        text: "Upsss, Terjadi Masalah Pada CHATGPT",
      })
      .catch(() => {});
    clearMessage(sender);
  }
};

const commands = {
  "/clear": async ([params]: string[]) => {
    console.log(params); // this still issued
    listMessage = {};
    return "Chat Cleared";
  },
  "/add-allowed": ([params]: string[]) => {
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
  "/set-maxsaved": ([params]: string[]) => {
    if (Array.isArray(params)) {
      maxChatSaved = Number(params[0] ?? maxChatSaved);
      return `Max Chat Saved : ${maxChatSaved}`;
    }
  },
  "/status": () => {
    return `System Online Since : ${onlineAt}`;
  },
};
const commander = new CommandProcessor(commands);

const handleCommand = async (whatsapp: typeof wa, msg: wa.MessageReceived) => {
  try {
    const caption = getMessageCaption(msg).split(" ");
    console.log(caption.slice(1));
    const res = await commander.parse(
      caption[0] as keyof typeof commands,
      caption.slice(1)
    );
    if (res) {
      whatsapp
        .sendTextMessage({
          sessionId: msg.sessionId,
          to: msg.key.remoteJid!,
          answering: msg,
          text: res.toString(),
        })
        .catch(() => {});
    }
  } catch (error: any) {
    console.log(error.message ?? "");
  }
};
