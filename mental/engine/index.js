const fs = require("fs-extra");
const path = require("path");
// require("../../config");
const knex = requireKnex();
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const baseRepo = requireUtil("baseRepo");

const customValidators = {};

// mental.createResource("type",data);
// mental.updateResource("type", identifier, data)
// mental.deleteResource("type",identifier)
// mental.getResources("type",query)
// mental.getResource("type",query)

const createResource = async (type, payload) => {
  // This method should take structure from json doc
  // It should validate the data
  // It should also make sense of relationships
  // We can handle following relationships
  // one_one - table_which_maintains_this_relationship, column
  // one_many - user has many addresses
  // - addresses table
  // - current resource id
  // many_many
  // - pivot table
  // columns
};

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

  console.log("customValidators", customValidators);

  customValidators["uniqueForAuthor"](payload);

  // Create Post

  // const post = await baseRepo.create(
  //   resourceModels["posts"]["sql_table"],
  //   payload
  // );

  // console.log("called engine", post);
};

const addValidator = (name, validator) => {
  customValidators[name] = validator;
};

module.exports = {
  run,
  addValidator,
};

// (async () => {
//   await run();
// })();
