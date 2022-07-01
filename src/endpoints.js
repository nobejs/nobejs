const mentalEngine = require("../mental/engine");

module.exports = (app) => {
  app.get("/liveness", async (req, res) => {
    mentalEngine();
    return res.code(200).send({ status: "I am alive" });
  });

  app.get("/readiness", async (req, res) => {
    return res.code(200).send({ status: "I am ready" });
  });

  return [
    {
      endpoints: [],
    },
  ];
};
