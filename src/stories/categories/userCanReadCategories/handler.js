const resolveUserFromRequest = requireHelper("resolveUserFromRequest");
const CategoryRepo = requireRepo("category");
const CategorySerializer = requireSerializer("category");

const execute = async (payload) => {
  return await CategoryRepo.findCategoriesOfAnUser(payload["user_uuid"]);
};

const authorizeUser = async () => {
  return true;
};

const prepareInput = ({ dataFromRequest, user }) => {
  const input = Object.assign({}, dataFromRequest);
  input["user_uuid"] = user;
  return input;
};

const validateInput = async (input) => {
  return true;
};

const generateOutput = async (output) => {
  return CategorySerializer.list(output);
};

module.exports = {
  run: execute,
  authorizeUser: authorizeUser,
  resolveUserFromRequest: resolveUserFromRequest,
  pickDataFromRequest: [],
  validateInput: validateInput,
  generateOutput: generateOutput,
  prepareInput: prepareInput,
};
