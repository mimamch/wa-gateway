const { config } = require("dotenv");
config();
const http = require("http");
const app = require("./app");
const { initPlugin } = require("./utils/plugin");

// initPlugin(require("./plugins/chat-gpt"));
initPlugin(require("./plugins/bard"));

const port = app.get("port");
var server = http.createServer(app);
server.on("listening", () => console.log("APP IS RUNNING ON PORT " + port));

server.listen(port);
