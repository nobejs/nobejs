const Config = require("./config")();
const httpServer = requireHttpServer();
const path = require("path");
const mentalEngine = require("./core/mental-js/engine");

mentalEngine.addFunction("uniqueForAuthor", (payload) => {
  console.log("I am custom validator", payload);
  return true;
});

mentalEngine.init({
  resourcesPath: path.resolve(`mental/resources`),
  hooksPath: path.resolve(`mental/hooks`),
  // mentalApiPrefix: "",
});

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
