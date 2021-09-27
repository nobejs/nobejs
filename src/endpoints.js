module.exports = (app) => {
  app.get("/liveness", async (req, res) => {
    return res.code(200).send({ status: "I am alive" });
  });

  app.get("/readiness", async (req, res) => {
    return res.code(200).send({ status: "I am ready" });
  });

  return [
    {
      apiPrefix: "/categories/",
      endpoints: [
        ["get", "/", "categories/userCanReadCategories"],
        ["post", "/", "categories/userCanCreateCategory"],
        ["get", "/:uuid", "categories/userCanReadCategory"],
        ["put", "/:uuid", "categories/userCanUpdateCategory"],
        ["delete", "/:uuid", "categories/userCanDeleteCategory"],
      ],
    },
  ];
};
