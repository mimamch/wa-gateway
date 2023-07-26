"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getMessageCaption = (msg) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return (((_a = msg.message) === null || _a === void 0 ? void 0 : _a.conversation) ||
        ((_c = (_b = msg.message) === null || _b === void 0 ? void 0 : _b.imageMessage) === null || _c === void 0 ? void 0 : _c.caption) ||
        ((_e = (_d = msg.message) === null || _d === void 0 ? void 0 : _d.videoMessage) === null || _e === void 0 ? void 0 : _e.caption) ||
        ((_g = (_f = msg.message) === null || _f === void 0 ? void 0 : _f.documentMessage) === null || _g === void 0 ? void 0 : _g.caption) ||
        ((_j = (_h = msg.message) === null || _h === void 0 ? void 0 : _h.extendedTextMessage) === null || _j === void 0 ? void 0 : _j.text) ||
        "");
};
exports.default = getMessageCaption;
