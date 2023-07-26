import { CommandProcessor } from "@mimamch/cmd";
import wa from "wa-multi-session";
import { Express } from "express";
import getMessageCaption from "../utils/get-caption";
import Bard from "../core/bard";

export const init = async ({
  app,
  whatsapp,
}: {
  app: Express;
  whatsapp: typeof wa;
}) => {
  try {
    configureBard(whatsapp);
    await Bard.init(process.env.BARD_API_KEY);
  } catch (error) {
    console.log(error);
  }
};

/**
 * @param {(import ('wa-multi-session'))} whatsapp
 */
const configureBard = (whatsapp: typeof wa) => {
  whatsapp.onMessageReceived((msg) => {
    handleBARD(whatsapp, msg);
  });
};

let onlineAt = new Date();
let maxChatSaved = 15;

interface ListMessage {
  [key: string]: any;
}

let listMessage: ListMessage = {};
const allowedSender = ["85838707828"];

const clearMessage = (id: string) => {
  // listMessage[id] = listMessage[id].slice(-maxChatSaved);
};

/**
 * @param {(import ('wa-multi-session'))} whatsapp
 * @param {(import ('wa-multi-session').MessageReceived)} msg
 */
const handleBARD = async (whatsapp: typeof wa, msg: wa.MessageReceived) => {
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
      listMessage[sender!] = new Bard.Chat();
    }
    const res = await listMessage[sender!].ask(caption);
    const responseMsg = res;

    await whatsapp.sendTextMessage({
      sessionId: msg.sessionId,
      to: sender,
      answering: msg,
      text: responseMsg,
    });
  } catch (error: any) {
    whatsapp
      .sendTextMessage({
        sessionId: msg.sessionId,
        to: msg.key.remoteJid!,
        answering: msg,
        text: error.message ?? "Bard Error",
      })
      .catch(() => {});
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
  "/status": () => {
    return `System Online Since : ${onlineAt}`;
  },
};
const commander = new CommandProcessor(commands);

const handleCommand = async (whatsapp: typeof wa, msg: wa.MessageReceived) => {
  try {
    const caption = getMessageCaption(msg).split(" ");
    console.log(caption.slice(1));
    const res = await commander.parseOrThrow(
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
    whatsapp
      .sendTextMessage({
        sessionId: msg.sessionId,
        to: msg.key.remoteJid!,
        answering: msg,
        text: error.message ?? "Command Failed",
      })
      .catch(() => {});
  }
};
