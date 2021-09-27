const Category = requireRepo("category");
const validator = requireValidator();
const resolveUserFromRequest = requireHelper("resolveUserFromRequest");
const CategorySerializer = requireSerializer("category");

const run = async (payload) => {
  return await Category.createCategory(payload);
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
              ? await Category.countAll({
                  name: input.name,
                  user_uuid: user,
                })
              : -1;
          return count === 0 ? true : false;
        },
      },
    },
  };

  return validator(input, constraints);
};

const generateOutput = async (output) => {
  return CategorySerializer.single(output);
};

module.exports = {
  run: run,
  prepareInput: prepareInput,
  resolveUserFromRequest: resolveUserFromRequest,
  pickDataFromRequest: ["name"],
  validateInput: validateInput,
  generateOutput: generateOutput,
};
