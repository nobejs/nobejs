const fs = require("fs-extra");
const path = require("path");
// require("../../config");
const knex = requireKnex();
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const baseRepo = requireUtil("baseRepo");

const run = async () => {
  const resourcesPath = path.resolve(`mental/resources`);

  let resources = fs.readdirSync(resourcesPath);

  let resourceModels = {};

  const request = {
    title: "Hello World",
    body: "Hey",
  };

  resources.forEach((resource) => {
    const resourcePath = path.resolve(`mental/resources/${resource}`);
    let resourceData = JSON.parse(fs.readFileSync(resourcePath, "utf-8"));

    if (resourceData.name) {
      resourceModels[resourceData.name] = resourceData;
    }
  });

  // Get posts directly

  let columns = resourceModels["posts"]["attributes"];
  columns = columns
    .filter((c) => {
      return c.type !== "relation";
    })
    .map((c) => {
      //   return `${resourceModels["posts"]["sql_table"]}.${c.name}`;
      return `${c.name}`;
    });

  const payload = pickKeysFromObject(request, columns);

  // Create Post

  const post = await baseRepo.create(
    resourceModels["posts"]["sql_table"],
    payload
  );

  console.log("called engine", post);
};

module.exports = run;

(async () => {
  await run();
})();
