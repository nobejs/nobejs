const prepare = ({ reqQuery, reqBody, reqParams }) => {
  return {};
};

const authorize = ({ prepareResult }) => {
  if (0) {
    throw {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  return true;
};

const handle = ({ prepareResult, storyName }) => {
  return {};
};

const respond = ({ handleResult }) => {
  return handleResult;
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
