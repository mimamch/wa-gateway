const ValidationError = require("../../utils/error");
const { responseErrorWithMessage } = require("../../utils/response");

module.exports = function errorHandlerMiddleware(error, req, res, next) {
  if (error instanceof ValidationError) {
    return res.status(400).json(responseErrorWithMessage(error.message));
  }
  console.log(error);
  return res.status(400).json(responseErrorWithMessage());
};
