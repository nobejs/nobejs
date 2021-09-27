const Config = require("./config")();
const httpServer = requireHttpServer();

const server = httpServer();

server.listen(process.env.PORT || 3000, (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});

// (async () => {
//   try {
//     const server = await httpServer(process.env.PORT || 3000);
//     loadEndpoints(server);
//   } catch (err) {
//     process.exit(1);
//   }
// })();
