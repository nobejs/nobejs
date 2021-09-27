const resolveUserFromRequest = requireHelper("resolveUserFromRequest");
const CategoryRepo = requireRepo("category");
const CategorySerializer = requireSerializer("category");
const debugLogger = requireUtil("debugLogger");

const run = async (payload) => {
  try {
    const category = await CategoryRepo.findCategoryOfAnUser(
      payload.user_uuid,
      payload.uuid
    );

    if (category) {
      return category;
    } else {
      throw {
        statusCode: 404,
        errorCode: "Not Found",
      };
    }
  } catch (error) {
    throw error;
  }
};

const prepareInput = ({ dataFromRequest, user }) => {
  const input = Object.assign({}, dataFromRequest);
  input["user_uuid"] = user;
  return input;
};

const generateOutput = async (output) => {
  return CategorySerializer.single(output);
};

module.exports = {
  resolveUserFromRequest: resolveUserFromRequest,
  authorizeUser: true,
  pickDataFromRequest: ["uuid"],
  run: run,
  prepareInput: prepareInput,
  generateOutput: generateOutput,
};
