module.exports = (request, reply, next) => {
  try {
    if (request.headers.origin) {
      reply.header("Access-Control-Allow-Origin", request.headers.origin);
    }

    reply.header(
      "Access-Control-Allow-Methods",
      "GET, PUT, POST, DELETE, PATCH, OPTIONS"
    );
    reply.header(
      "Access-Control-Allow-Headers",
      "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,X-Client-Identifier,X-Team-Identifier"
    );
    reply.header("Access-Control-Allow-Credentials", "true");

    if (request.method === "OPTIONS") {
      reply.header("Content-Type", "text/plain charset=UTF-8");
      reply.header("Content-Length", "0");
      reply.header("Access-Control-Max-Age", "1728000");
      reply.code(204);
      reply.send();
    } else {
      next();
    }
  } catch (e) {
    throw e;
  }
};
