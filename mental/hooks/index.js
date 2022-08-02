const beforePrepareCreateStates = async (context) => {
  console.log("beforePrepareCreateStates hooks");
  return context;
};

module.exports = {
  beforePrepareCreateStates,
};
