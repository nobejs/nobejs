const checkMissingFunctions = require("./utils/checkMissingFunctions");

module.exports = (sequence) => {
  return async (story, ...args) => {
    const storyContext = requireStory(story);
    const handlerFunctions = Object.keys(storyContext);
    let missingFunctions = checkMissingFunctions(handlerFunctions, sequence);

    if (!missingFunctions.length) {
    } else {
      throw {
        statusCode: 500,
        message: "Missing Functions or Files",
        missingFunctions,
      };
    }

    let executionContext = Object.assign({}, ...args);

    try {
      for (const ord of sequence) {
        executionContext[ord] = await storyContext[ord].apply(null, [
          executionContext,
        ]);
      }

      return executionContext;
    } catch (error) {
      throw error;
    }
  };
};
