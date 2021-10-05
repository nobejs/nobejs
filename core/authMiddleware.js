var jwt_decode = require("jwt-decode");
const { pathToRegexp } = require("path-to-regexp");
const Config = require("../config")();

const exclude = Config["excludeFromAuth"];

module.exports = (req, reply, next) => {
  let needsAuth = true;

  exclude.forEach((p) => {
    let [method, path] = p.split(" ");
    let regex = pathToRegexp(path);
    if (method == req.method && regex.exec(req.routerPath) !== null) {
      needsAuth = false;
    }
  });

  if (needsAuth) {
    if (!req.headers.authorization) {
      return reply.code(401).send({ error: "Unauthenticated" });
    }
    const bearer = req.headers.authorization.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    let decoded = jwt_decode(req.token);
    if (!decoded.sub) {
      return reply.code(401).send({ error: "Unauthenticated" });
    }
    req.user = decoded.sub;
  }

  next();
};
