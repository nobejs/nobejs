const Config = require("./config")();
const httpServer = requireHttpServer();
const mentalEngine = require("./mental/engine");

mentalEngine.addValidator("uniqueForAuthor", (payload) => {
  console.log("I am custom validator", payload);
  return true;
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
