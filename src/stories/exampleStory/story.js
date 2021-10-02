const prepare = ({ reqQuery }) => {
  return {
    a: parseInt(reqQuery.a),
    b: parseInt(reqQuery.b),
  };
};

const authorize = ({ prepareResult }) => {
  if (prepareResult.user === "71360e7b-c876-494b-9e0b-d75f1e306995") {
    throw {
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  return true;
};

const handle = ({ prepareResult, storyName }) => {
  return { sum: prepareResult.a + prepareResult.b };
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
