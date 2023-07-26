"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const cmd_1 = require("@mimamch/cmd");
const get_caption_1 = __importDefault(require("../utils/get-caption"));
const bard_1 = __importDefault(require("../core/bard"));
const init = ({ app, whatsapp, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        configureBard(whatsapp);
        yield bard_1.default.init(process.env.BARD_API_KEY);
    }
    catch (error) {
        console.log(error);
    }
});
exports.init = init;
/**
 * @param {(import ('wa-multi-session'))} whatsapp
 */
const configureBard = (whatsapp) => {
    whatsapp.onMessageReceived((msg) => {
        handleBARD(whatsapp, msg);
    });
};
let onlineAt = new Date();
let maxChatSaved = 15;
let listMessage = {};
const allowedSender = ["85838707828"];
const clearMessage = (id) => {
    // listMessage[id] = listMessage[id].slice(-maxChatSaved);
};
/**
 * @param {(import ('wa-multi-session'))} whatsapp
 * @param {(import ('wa-multi-session').MessageReceived)} msg
 */
const handleBARD = (whatsapp, msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const sender = msg.key.remoteJid;
    try {
        const allowed = allowedSender.some((val) => sender.includes(val));
        if (!allowed || msg.key.fromMe)
            return;
        const caption = (0, get_caption_1.default)(msg);
        if (caption.startsWith("/")) {
            return handleCommand(whatsapp, msg);
        }
        yield whatsapp.readMessage({ sessionId: msg.sessionId, key: msg.key });
        whatsapp
            .sendTyping({
            sessionId: msg.sessionId,
            duration: 5000,
            to: msg.key.remoteJid,
        })
            .catch(() => { });
        if (!(sender in listMessage)) {
            listMessage[sender] = new bard_1.default.Chat();
        }
        const res = yield listMessage[sender].ask(caption);
        const responseMsg = res;
        yield whatsapp.sendTextMessage({
            sessionId: msg.sessionId,
            to: sender,
            answering: msg,
            text: responseMsg,
        });
    }
    catch (error) {
        whatsapp
            .sendTextMessage({
            sessionId: msg.sessionId,
            to: msg.key.remoteJid,
            answering: msg,
            text: (_a = error.message) !== null && _a !== void 0 ? _a : "Bard Error",
        })
            .catch(() => { });
    }
});
const commands = {
    "/clear": ([params]) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(params); // this still issued
        listMessage = {};
        return "Chat Cleared";
    }),
    "/add-allowed": ([params]) => {
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
const commander = new cmd_1.CommandProcessor(commands);
const handleCommand = (whatsapp, msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const caption = (0, get_caption_1.default)(msg).split(" ");
        console.log(caption.slice(1));
        const res = yield commander.parseOrThrow(caption[0], caption.slice(1));
        if (res) {
            whatsapp
                .sendTextMessage({
                sessionId: msg.sessionId,
                to: msg.key.remoteJid,
                answering: msg,
                text: res.toString(),
            })
                .catch(() => { });
        }
    }
    catch (error) {
        console.log((_b = error.message) !== null && _b !== void 0 ? _b : "");
        whatsapp
            .sendTextMessage({
            sessionId: msg.sessionId,
            to: msg.key.remoteJid,
            answering: msg,
            text: (_c = error.message) !== null && _c !== void 0 ? _c : "Command Failed",
        })
            .catch(() => { });
    }
});
