const P = require("pino");

module.exports = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
