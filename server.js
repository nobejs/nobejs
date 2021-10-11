const Config = require("./config")();
const httpServer = requireHttpServer();

const server = httpServer({
  logger: process.env.DEBUG === "true" ? true : false,
});

server.listen(process.env.PORT || 3000, "0.0.0.0", (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
