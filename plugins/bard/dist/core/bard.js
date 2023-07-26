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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = exports.askAI = exports.queryBard = exports.init = void 0;
let session, SNlM0e;
const init = (sessionID) => __awaiter(void 0, void 0, void 0, function* () {
    session = {
        baseURL: "https://bard.google.com",
        headers: {
            Host: "bard.google.com",
            "X-Same-Domain": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            Origin: "https://bard.google.com",
            Referer: "https://bard.google.com/",
            Cookie: `__Secure-1PSID=${sessionID};`,
        },
    };
    const response = yield fetch("https://bard.google.com/", {
        method: "GET",
        headers: session.headers,
        credentials: "include",
    });
    const data = yield response.text();
    const match = data.match(/SNlM0e":"(.*?)"/);
    if (match)
        SNlM0e = match[1];
    else
        throw new Error("Could not get Google Bard.");
    return SNlM0e;
});
exports.init = init;
const queryBard = (message, ids = {}) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!SNlM0e)
        throw new Error("Make sure to call Bard.init(SESSION_ID) first.");
    // Parameters and POST data
    const params = {
        bl: "boq_assistant-bard-web-server_20230711.08_p0",
        _reqID: ids._reqID ? `${ids._reqID}` : "0",
        rt: "c",
    };
    const messageStruct = [
        [message],
        null,
        ids ? Object.values(ids).slice(0, 3) : [null, null, null],
    ];
    const data = {
        "f.req": JSON.stringify([null, JSON.stringify(messageStruct)]),
        at: SNlM0e,
    };
    let url = new URL("/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate", session.baseURL);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    let formBody = [];
    for (let property in data) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(data[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    const response = yield fetch(url.toString(), {
        method: "POST",
        headers: session.headers,
        body: formBody,
        credentials: "include",
    });
    const responseData = yield response.text();
    const chatData = JSON.parse(responseData.split("\n")[3])[0][2];
    // Check if there is data
    if (!chatData) {
        throw new Error(`Google Bard encountered an error ${responseData}.`);
    }
    // Get important data, and update with important data if set to do so
    const parsedChatData = JSON.parse(chatData);
    const bardResponseData = JSON.parse(chatData)[4][0];
    let text = bardResponseData[1][0];
    let images = (_a = bardResponseData[4]) === null || _a === void 0 ? void 0 : _a.map((x) => {
        return {
            tag: x[2],
            url: x[3][0][0],
            source: {
                original: x[0][0][0],
                website: x[1][0][0],
                name: x[1][1],
                favicon: x[1][3],
            },
        };
    });
    return {
        content: formatMarkdown(text, images),
        images: images,
        ids: {
            // Make sure kept in order, because using Object.keys() to query above
            conversationID: parsedChatData[1][0],
            responseID: parsedChatData[1][1],
            choiceID: parsedChatData[4][0][0],
            _reqID: parseInt((_b = ids._reqID) !== null && _b !== void 0 ? _b : 0) + 100000,
        },
    };
});
exports.queryBard = queryBard;
const formatMarkdown = (text, images) => {
    if (!images)
        return text;
    for (let imageData of images) {
        const formattedTag = `!${imageData.tag}(${imageData.url})`;
        text = text.replace(new RegExp("(?<!!)" + imageData.tag.replace("[", "\\[").replace("]", "\\]")), formattedTag);
    }
    return text;
};
const askAI = (message, useJSON = false) => __awaiter(void 0, void 0, void 0, function* () {
    if (useJSON)
        return yield (0, exports.queryBard)(message);
    else
        return (yield (0, exports.queryBard)(message)).content;
});
exports.askAI = askAI;
class Chat {
    constructor(ids) {
        this.ids = ids;
    }
    ask(message, useJSON = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = yield (0, exports.queryBard)(message, this.ids);
            this.ids = Object.assign({}, request.ids);
            if (useJSON)
                return request;
            else
                return request.content;
        });
    }
    export() {
        return this.ids;
    }
}
exports.Chat = Chat;
exports.default = { init: exports.init, askAI: exports.askAI, Chat };
