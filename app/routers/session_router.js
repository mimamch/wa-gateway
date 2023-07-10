const { Router } = require("express");
const {
  createSession,
  deleteSession,
  sessions,
} = require("../controllers/session_controller");

const SessionRouter = Router();

SessionRouter.all("/start-session", createSession);
SessionRouter.all("/delete-session", deleteSession);
SessionRouter.all("/sessions", sessions);

module.exports = SessionRouter;
