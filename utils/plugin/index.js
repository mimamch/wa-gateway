const whatsapp = require("wa-multi-session");
const app = require("../../app");
const ValidationError = require("../error");

exports.initPlugin = (plugin) => {
  if (!("init" in plugin)) {
    throw new ValidationError("Undefined Init on Plugin");
  }
  plugin.init({ app, whatsapp });
};
