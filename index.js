const http = require("http");
const { config } = require("dotenv");
const app = require("./app");
const { initPlugin } = require("./utils/plugin");
config();

initPlugin(require("./plugins/chat-gpt"));

const port = app.get("port");
var server = http.createServer(app);
server.on("listening", () => console.log("APP IS RUNNING ON PORT " + port));

server.listen(port);
