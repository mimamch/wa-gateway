const { Router } = require("express");
const {
  createSession,
  deleteSession,
} = require("../controllers/session_controller");

const SessionRouter = Router();

SessionRouter.all("/start-session", createSession);
SessionRouter.all("/delete-session", deleteSession);

module.exports = SessionRouter;
