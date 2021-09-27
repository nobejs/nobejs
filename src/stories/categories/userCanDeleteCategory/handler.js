const CategoryRepo = requireRepo("category");
const validator = requireValidator();
const resolveUserFromRequest = requireHelper("resolveUserFromRequest");
const CategorySerializer = requireSerializer("category");
const pickKeysFromObject = requireUtil("pickKeysFromObject");
const debugLogger = requireUtil("debugLogger");

const run = async (payload) => {
  debugLogger(payload);
  return await CategoryRepo.deleteCategory(payload.uuid);
};

const prepareInput = ({ dataFromRequest, user }) => {
  const input = Object.assign({}, dataFromRequest);
  input["user_uuid"] = user;
  return input;
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

const generateOutput = async () => {
  return {
    message: "Resource Destroyed",
  };
};

module.exports = {
  run: run,
  authorizeUser: authorizeUser,
  prepareInput: prepareInput,
  resolveUserFromRequest: resolveUserFromRequest,
  pickDataFromRequest: ["name", "uuid"],
  generateOutput: generateOutput,
};
