"use strict";
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/core/init.ts
var import_openai = require("openai");
var import_cmd = require("@mimamch/cmd");

// src/utils/get-caption.ts
var getMessageCaption = (msg) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  return ((_a = msg.message) == null ? void 0 : _a.conversation) || ((_c = (_b = msg.message) == null ? void 0 : _b.imageMessage) == null ? void 0 : _c.caption) || ((_e = (_d = msg.message) == null ? void 0 : _d.videoMessage) == null ? void 0 : _e.caption) || ((_g = (_f = msg.message) == null ? void 0 : _f.documentMessage) == null ? void 0 : _g.caption) || ((_i = (_h = msg.message) == null ? void 0 : _h.extendedTextMessage) == null ? void 0 : _i.text) || "";
};
var get_caption_default = getMessageCaption;

// src/core/init.ts
var config = new import_openai.Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
var openai = new import_openai.OpenAIApi(config);
var init = ({
  app,
  whatsapp
}) => {
  app.get("/hello", (req, res) => {
    res.send("hello");
  });
  configureWa(whatsapp);
};
var configureWa = (whatsapp) => {
  whatsapp.onMessageReceived((msg) => {
    handleGPT(whatsapp, msg);
  });
};
var onlineAt = /* @__PURE__ */ new Date();
var maxChatSaved = 15;
var listMessage = {};
var allowedSender = ["85838707828"];
var clearMessage = (id) => {
  listMessage[id] = listMessage[id].slice(-maxChatSaved);
};
var handleGPT = (whatsapp, msg) => __async(void 0, null, function* () {
  const sender = msg.key.remoteJid;
  try {
    const allowed = allowedSender.some((val) => sender.includes(val));
    if (!allowed || msg.key.fromMe)
      return;
    const caption = get_caption_default(msg);
    if (caption.startsWith("/")) {
      return handleCommand(whatsapp, msg);
    }
    yield whatsapp.readMessage({ sessionId: msg.sessionId, key: msg.key });
    whatsapp.sendTyping({
      sessionId: msg.sessionId,
      duration: 5e3,
      to: msg.key.remoteJid
    }).catch(() => {
    });
    if (!(sender in listMessage)) {
      listMessage[sender] = [];
    }
    listMessage[sender].push({
      role: "user",
      content: caption
    });
    const res = yield openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: listMessage[sender],
      temperature: 0
      //   max_tokens: 30,
    });
    const responseMsg = res.data.choices[0].message;
    listMessage[sender].push(responseMsg);
    yield whatsapp.sendTextMessage({
      sessionId: msg.sessionId,
      to: sender,
      answering: msg,
      text: responseMsg.content
    });
    clearMessage(sender);
  } catch (error) {
    whatsapp.sendTextMessage({
      sessionId: msg.sessionId,
      to: msg.key.remoteJid,
      answering: msg,
      text: "Upsss, Terjadi Masalah Pada CHATGPT"
    }).catch(() => {
    });
    clearMessage(sender);
  }
});
var commands = {
  "/clear": (_0) => __async(void 0, [_0], function* ([params]) {
    console.log(params);
    listMessage = {};
    return "Chat Cleared";
  }),
  "/add-allowed": ([params]) => {
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
  "/set-maxsaved": ([params]) => {
    var _a;
    if (Array.isArray(params)) {
      maxChatSaved = Number((_a = params[0]) != null ? _a : maxChatSaved);
      return `Max Chat Saved : ${maxChatSaved}`;
    }
  },
  "/status": () => {
    return `System Online Since : ${onlineAt}`;
  }
};
var commander = new import_cmd.CommandProcessor(commands);
var handleCommand = (whatsapp, msg) => __async(void 0, null, function* () {
  var _a;
  try {
    const caption = get_caption_default(msg).split(" ");
    console.log(caption.slice(1));
    const res = yield commander.parse(
      caption[0],
      caption.slice(1)
    );
    if (res) {
      whatsapp.sendTextMessage({
        sessionId: msg.sessionId,
        to: msg.key.remoteJid,
        answering: msg,
        text: res.toString()
      }).catch(() => {
      });
    }
  } catch (error) {
    console.log((_a = error.message) != null ? _a : "");
  }
});

// src/index.ts
module.exports = {
  init
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvcmUvaW5pdC50cyIsICIuLi9zcmMvdXRpbHMvZ2V0LWNhcHRpb24udHMiLCAiLi4vc3JjL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBDaGF0Q29tcGxldGlvblJlcXVlc3RNZXNzYWdlLCBDb25maWd1cmF0aW9uLCBPcGVuQUlBcGkgfSBmcm9tIFwib3BlbmFpXCI7XHJcbmltcG9ydCB7IENvbW1hbmRQcm9jZXNzb3IgfSBmcm9tIFwiQG1pbWFtY2gvY21kXCI7XHJcbmltcG9ydCB3YSBmcm9tIFwid2EtbXVsdGktc2Vzc2lvblwiO1xyXG5pbXBvcnQgeyBFeHByZXNzIH0gZnJvbSBcImV4cHJlc3NcIjtcclxuaW1wb3J0IGdldE1lc3NhZ2VDYXB0aW9uIGZyb20gXCIuLi91dGlscy9nZXQtY2FwdGlvblwiO1xyXG5cclxuY29uc3QgY29uZmlnID0gbmV3IENvbmZpZ3VyYXRpb24oe1xyXG4gIGFwaUtleTogcHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVksXHJcbn0pO1xyXG5cclxuY29uc3Qgb3BlbmFpID0gbmV3IE9wZW5BSUFwaShjb25maWcpO1xyXG5cclxuZXhwb3J0IGNvbnN0IGluaXQgPSAoe1xyXG4gIGFwcCxcclxuICB3aGF0c2FwcCxcclxufToge1xyXG4gIGFwcDogRXhwcmVzcztcclxuICB3aGF0c2FwcDogdHlwZW9mIHdhO1xyXG59KSA9PiB7XHJcbiAgYXBwLmdldChcIi9oZWxsb1wiLCAocmVxLCByZXMpID0+IHtcclxuICAgIHJlcy5zZW5kKFwiaGVsbG9cIik7XHJcbiAgfSk7XHJcbiAgY29uZmlndXJlV2Eod2hhdHNhcHApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7KGltcG9ydCAoJ3dhLW11bHRpLXNlc3Npb24nKSl9IHdoYXRzYXBwXHJcbiAqL1xyXG5jb25zdCBjb25maWd1cmVXYSA9ICh3aGF0c2FwcDogdHlwZW9mIHdhKSA9PiB7XHJcbiAgd2hhdHNhcHAub25NZXNzYWdlUmVjZWl2ZWQoKG1zZykgPT4ge1xyXG4gICAgaGFuZGxlR1BUKHdoYXRzYXBwLCBtc2cpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxubGV0IG9ubGluZUF0ID0gbmV3IERhdGUoKTtcclxubGV0IG1heENoYXRTYXZlZCA9IDE1O1xyXG5cclxuaW50ZXJmYWNlIExpc3RNZXNzYWdlIHtcclxuICBba2V5OiBzdHJpbmddOiBDaGF0Q29tcGxldGlvblJlcXVlc3RNZXNzYWdlW107XHJcbn1cclxuXHJcbmxldCBsaXN0TWVzc2FnZTogTGlzdE1lc3NhZ2UgPSB7fTtcclxuY29uc3QgYWxsb3dlZFNlbmRlciA9IFtcIjg1ODM4NzA3ODI4XCJdO1xyXG5cclxuY29uc3QgY2xlYXJNZXNzYWdlID0gKGlkOiBzdHJpbmcpID0+IHtcclxuICBsaXN0TWVzc2FnZVtpZF0gPSBsaXN0TWVzc2FnZVtpZF0uc2xpY2UoLW1heENoYXRTYXZlZCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHsoaW1wb3J0ICgnd2EtbXVsdGktc2Vzc2lvbicpKX0gd2hhdHNhcHBcclxuICogQHBhcmFtIHsoaW1wb3J0ICgnd2EtbXVsdGktc2Vzc2lvbicpLk1lc3NhZ2VSZWNlaXZlZCl9IG1zZ1xyXG4gKi9cclxuY29uc3QgaGFuZGxlR1BUID0gYXN5bmMgKHdoYXRzYXBwOiB0eXBlb2Ygd2EsIG1zZzogd2EuTWVzc2FnZVJlY2VpdmVkKSA9PiB7XHJcbiAgY29uc3Qgc2VuZGVyID0gbXNnLmtleS5yZW1vdGVKaWQhO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhbGxvd2VkID0gYWxsb3dlZFNlbmRlci5zb21lKCh2YWwpID0+IHNlbmRlci5pbmNsdWRlcyh2YWwpKTtcclxuICAgIGlmICghYWxsb3dlZCB8fCBtc2cua2V5LmZyb21NZSkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGNhcHRpb24gPSBnZXRNZXNzYWdlQ2FwdGlvbihtc2cpO1xyXG5cclxuICAgIGlmIChjYXB0aW9uLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XHJcbiAgICAgIHJldHVybiBoYW5kbGVDb21tYW5kKHdoYXRzYXBwLCBtc2cpO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IHdoYXRzYXBwLnJlYWRNZXNzYWdlKHsgc2Vzc2lvbklkOiBtc2cuc2Vzc2lvbklkLCBrZXk6IG1zZy5rZXkgfSk7XHJcbiAgICB3aGF0c2FwcFxyXG4gICAgICAuc2VuZFR5cGluZyh7XHJcbiAgICAgICAgc2Vzc2lvbklkOiBtc2cuc2Vzc2lvbklkLFxyXG4gICAgICAgIGR1cmF0aW9uOiA1MDAwLFxyXG4gICAgICAgIHRvOiBtc2cua2V5LnJlbW90ZUppZCEsXHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaCgoKSA9PiB7fSk7XHJcblxyXG4gICAgaWYgKCEoc2VuZGVyIGluIGxpc3RNZXNzYWdlKSkge1xyXG4gICAgICBsaXN0TWVzc2FnZVtzZW5kZXIhXSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGxpc3RNZXNzYWdlW3NlbmRlcl0ucHVzaCh7XHJcbiAgICAgIHJvbGU6IFwidXNlclwiLFxyXG4gICAgICBjb250ZW50OiBjYXB0aW9uLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgb3BlbmFpLmNyZWF0ZUNoYXRDb21wbGV0aW9uKHtcclxuICAgICAgbW9kZWw6IFwiZ3B0LTMuNS10dXJib1wiLFxyXG4gICAgICBtZXNzYWdlczogbGlzdE1lc3NhZ2Vbc2VuZGVyXSxcclxuICAgICAgdGVtcGVyYXR1cmU6IDAsXHJcbiAgICAgIC8vICAgbWF4X3Rva2VuczogMzAsXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IHJlc3BvbnNlTXNnID0gcmVzLmRhdGEuY2hvaWNlc1swXS5tZXNzYWdlITtcclxuICAgIGxpc3RNZXNzYWdlW3NlbmRlcl0ucHVzaChyZXNwb25zZU1zZyk7XHJcblxyXG4gICAgYXdhaXQgd2hhdHNhcHAuc2VuZFRleHRNZXNzYWdlKHtcclxuICAgICAgc2Vzc2lvbklkOiBtc2cuc2Vzc2lvbklkLFxyXG4gICAgICB0bzogc2VuZGVyLFxyXG4gICAgICBhbnN3ZXJpbmc6IG1zZyxcclxuICAgICAgdGV4dDogcmVzcG9uc2VNc2cuY29udGVudCxcclxuICAgIH0pO1xyXG4gICAgY2xlYXJNZXNzYWdlKHNlbmRlcik7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHdoYXRzYXBwXHJcbiAgICAgIC5zZW5kVGV4dE1lc3NhZ2Uoe1xyXG4gICAgICAgIHNlc3Npb25JZDogbXNnLnNlc3Npb25JZCxcclxuICAgICAgICB0bzogbXNnLmtleS5yZW1vdGVKaWQhLFxyXG4gICAgICAgIGFuc3dlcmluZzogbXNnLFxyXG4gICAgICAgIHRleHQ6IFwiVXBzc3MsIFRlcmphZGkgTWFzYWxhaCBQYWRhIENIQVRHUFRcIixcclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKCgpID0+IHt9KTtcclxuICAgIGNsZWFyTWVzc2FnZShzZW5kZXIpO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IGNvbW1hbmRzID0ge1xyXG4gIFwiL2NsZWFyXCI6IGFzeW5jIChbcGFyYW1zXTogc3RyaW5nW10pID0+IHtcclxuICAgIGNvbnNvbGUubG9nKHBhcmFtcyk7IC8vIHRoaXMgc3RpbGwgaXNzdWVkXHJcbiAgICBsaXN0TWVzc2FnZSA9IHt9O1xyXG4gICAgcmV0dXJuIFwiQ2hhdCBDbGVhcmVkXCI7XHJcbiAgfSxcclxuICBcIi9hZGQtYWxsb3dlZFwiOiAoW3BhcmFtc106IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJhbXMpKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKHBhcmFtcyk7XHJcbiAgICAgIHBhcmFtcy5tYXAoKGUpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIGUgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgYWxsb3dlZFNlbmRlci5wdXNoKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBhbGxvd2VkU2VuZGVyO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCIvZ2V0LWFsbG93ZWRcIjogKCkgPT4ge1xyXG4gICAgcmV0dXJuIGFsbG93ZWRTZW5kZXI7XHJcbiAgfSxcclxuICBcIi9zZXQtbWF4c2F2ZWRcIjogKFtwYXJhbXNdOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1zKSkge1xyXG4gICAgICBtYXhDaGF0U2F2ZWQgPSBOdW1iZXIocGFyYW1zWzBdID8/IG1heENoYXRTYXZlZCk7XHJcbiAgICAgIHJldHVybiBgTWF4IENoYXQgU2F2ZWQgOiAke21heENoYXRTYXZlZH1gO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCIvc3RhdHVzXCI6ICgpID0+IHtcclxuICAgIHJldHVybiBgU3lzdGVtIE9ubGluZSBTaW5jZSA6ICR7b25saW5lQXR9YDtcclxuICB9LFxyXG59O1xyXG5jb25zdCBjb21tYW5kZXIgPSBuZXcgQ29tbWFuZFByb2Nlc3Nvcihjb21tYW5kcyk7XHJcblxyXG5jb25zdCBoYW5kbGVDb21tYW5kID0gYXN5bmMgKHdoYXRzYXBwOiB0eXBlb2Ygd2EsIG1zZzogd2EuTWVzc2FnZVJlY2VpdmVkKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGNhcHRpb24gPSBnZXRNZXNzYWdlQ2FwdGlvbihtc2cpLnNwbGl0KFwiIFwiKTtcclxuICAgIGNvbnNvbGUubG9nKGNhcHRpb24uc2xpY2UoMSkpO1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgY29tbWFuZGVyLnBhcnNlKFxyXG4gICAgICBjYXB0aW9uWzBdIGFzIGtleW9mIHR5cGVvZiBjb21tYW5kcyxcclxuICAgICAgY2FwdGlvbi5zbGljZSgxKVxyXG4gICAgKTtcclxuICAgIGlmIChyZXMpIHtcclxuICAgICAgd2hhdHNhcHBcclxuICAgICAgICAuc2VuZFRleHRNZXNzYWdlKHtcclxuICAgICAgICAgIHNlc3Npb25JZDogbXNnLnNlc3Npb25JZCxcclxuICAgICAgICAgIHRvOiBtc2cua2V5LnJlbW90ZUppZCEsXHJcbiAgICAgICAgICBhbnN3ZXJpbmc6IG1zZyxcclxuICAgICAgICAgIHRleHQ6IHJlcy50b1N0cmluZygpLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKCgpID0+IHt9KTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICBjb25zb2xlLmxvZyhlcnJvci5tZXNzYWdlID8/IFwiXCIpO1xyXG4gIH1cclxufTtcclxuIiwgImltcG9ydCAqIGFzIHdhIGZyb20gXCJ3YS1tdWx0aS1zZXNzaW9uXCI7XHJcbmNvbnN0IGdldE1lc3NhZ2VDYXB0aW9uID0gKG1zZzogd2EuTWVzc2FnZVJlY2VpdmVkKSA9PiB7XHJcbiAgcmV0dXJuIChcclxuICAgIG1zZy5tZXNzYWdlPy5jb252ZXJzYXRpb24gfHxcclxuICAgIG1zZy5tZXNzYWdlPy5pbWFnZU1lc3NhZ2U/LmNhcHRpb24gfHxcclxuICAgIG1zZy5tZXNzYWdlPy52aWRlb01lc3NhZ2U/LmNhcHRpb24gfHxcclxuICAgIG1zZy5tZXNzYWdlPy5kb2N1bWVudE1lc3NhZ2U/LmNhcHRpb24gfHxcclxuICAgIG1zZy5tZXNzYWdlPy5leHRlbmRlZFRleHRNZXNzYWdlPy50ZXh0IHx8XHJcbiAgICBcIlwiXHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdldE1lc3NhZ2VDYXB0aW9uO1xyXG4iLCAiaW1wb3J0IHsgaW5pdCB9IGZyb20gXCIuL2NvcmUvaW5pdFwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgaW5pdCxcclxufTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvQkFBdUU7QUFDdkUsaUJBQWlDOzs7QUNBakMsSUFBTSxvQkFBb0IsQ0FBQyxRQUE0QjtBQUR2RDtBQUVFLFdBQ0UsU0FBSSxZQUFKLG1CQUFhLG1CQUNiLGVBQUksWUFBSixtQkFBYSxpQkFBYixtQkFBMkIsY0FDM0IsZUFBSSxZQUFKLG1CQUFhLGlCQUFiLG1CQUEy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