const checkMissingFunctions = require("./utils/checkMissingFunctions");

module.exports = async (story, input, user) => {
  try {
    const storyContext = requireStory(story);

    const handlerFunctions = Object.keys(storyContext);

    let missingFunctions = checkMissingFunctions(handlerFunctions, [
      "run",
      "authorizeUser",
      "validateInput",
      "prepareInput",
    ]);

    if (!missingFunctions.length) {
      const executionContext = {};
      executionContext["user"] = user;

      const isUserAuthorized = await storyContext.authorizeUser(
        user,
        executionContext
      );

      if (isUserAuthorized) {
        executionContext["dataFromRequest"] = input;

        let inputPayload = await storyContext.prepareInput(executionContext);

        let inputIsValid = await storyContext.validateInput(inputPayload);

        if (inputIsValid) {
          const handlerResult = await storyContext.run(
            inputPayload,
            executionContext
          );

          return handlerResult;
        } else {
          throw {
            message: "InvalidInput",
            statusCode: 422,
          };
        }
      } else {
        throw {
          message: "NotAuthorized",
          statusCode: 403,
        };
      }
    } else {
      throw {
        statusCode: 500,
        message: "Missing Functions or Files",
        missingFunctions,
      };
    }
  } catch (error) {
    throw error;
  }
};

// API:

// authorize -> getInputFromHttpRequest -> validateInput -> handler -> sendResponse

// CMD:

// authorize -> validateInput -> handler
