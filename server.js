const Config = require("./config")();
const httpServer = requireHttpServer();
const bootstrapMental = require("./mental/bootstrap");

const server = httpServer({});

bootstrapMental(server);

server.listen(
  { port: process.env.PORT || 3000, host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
  }
);
