exports.input = (req, name) => req.body[name] || req.query[name] || req.headers[name];
