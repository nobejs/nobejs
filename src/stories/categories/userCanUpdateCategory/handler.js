/**
 * This story is to update category via a HTTP/Internal testing.
 * The use case of this story is to update a RDBMS: whenever user clicks
 */

const CategoryRepo = requireRepo("category");
const validator = requireValidator();
const resolveUserFromRequest = requireHelper("resolveUserFromRequest");
const CategorySerializer = requireSerializer("category");
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const debugLogger = requireUtil("debugLogger");

/**
 * This story is to update category via a HTTP/Internal testing.
 * The use case of this story is to update a RDBMS: whenever user clicks
 */
const run = async (payload) => {
  return await CategoryRepo.updateCategory(
    payload.uuid,
    pickKeysFromObject(payload, ["name"])
  );
};

const prepareInput = ({ dataFromRequest, user }) => {
  const input = Object.assign({}, dataFromRequest);
  input["user_uuid"] = user;
  return input;
};

const validateInput = async (input, { user }) => {
  const constraints = {
    name: {
      presence: {
        allowEmpty: false,
        message: "^Please enter name",
      },
      type: "string",
      custom_callback: {
        message: "Category name should be unique",
        callback: async (payload) => {
          let count =
            typeof payload.name === "string"
              ? await CategoryRepo.countAll(
                  {
                    name: input.name,
                    user_uuid: user,
                  },
                  {
                    uuid: input.uuid,
                  }
                )
              : -1;
          return count === 0 ? true : false;
        },
      },
    },
  };

  return validator(input, constraints);
};

const authorizeUser = async (user, { inputPayload }) => {
  let category = await CategoryRepo.first({
    uuid: inputPayload.uuid,
  });

  if (category.user_uuid === user) {
    return true;
  }

  return false;
};

const generateOutput = async (output) => {
  return CategorySerializer.single(output);
};

module.exports = {
  run: run,
  authorizeUser: authorizeUser,
  prepareInput: prepareInput,
  resolveUserFromRequest: resolveUserFromRequest,
  pickDataFromRequest: ["name", "uuid"],
  validateInput: validateInput,
  generateOutput: generateOutput,
};
