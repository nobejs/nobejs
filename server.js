const Config = require("./config")();
const httpServer = requireHttpServer();
const path = require("path");
const mentalEngine = require("./mental-nodejs/engine");

mentalEngine.addFunction("uniqueForAuthor", (payload) => {
  console.log("I am custom validator", payload);
  return true;
});

mentalEngine.init(path.resolve(`mental-nobejs/resources`));

const server = httpServer({});

server.listen(
  { port: process.env.PORT || 3000, host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
  }
);
