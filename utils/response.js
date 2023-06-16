exports.responseSuccessWithData = (data) => ({ data: data });
exports.responseSuccessWithMessage = (
  message = "Yeyy... Request Send With Successfully"
) => ({
  message: message,
});
exports.responseErrorWithMessage = (
  message = "Upsss... Something went wrong on server"
) => ({
  message: message,
});
