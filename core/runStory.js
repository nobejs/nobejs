const checkMissingFunctions = require("./utils/checkMissingFunctions");
const findKeysFromRequest = requireUtil("findKeysFromRequest");
const debugLogger = requireUtil("debugLogger");

module.exports = async (story, req, res, next) => {
  try {
    const storyContext = requireStory(story);

    const handlerFunctions = Object.keys(storyContext);

    let missingFunctions = checkMissingFunctions(handlerFunctions, [
      "run",
      // "authorizeUser",
      "resolveUserFromRequest",
      "pickDataFromRequest",
      "prepareInput",
      // "validateInput",
    ]);

    if (!missingFunctions.length) {
      const executionContext = {
        req,
        res,
        next,
        requestBody: req.body,
        requestParams: req.params,
        requestQuery: req.query,
      };

      // Resolve user from request

      const user = await storyContext.resolveUserFromRequest(executionContext);

      if (!user) {
        throw {
          message: "InvalidUser",
          statusCode: 401,
          user: user,
        };
      }

      executionContext["user"] = user;

      // Start -- Pick Data From Request

      if (storyContext.pickDataFromRequest instanceof Array) {
        executionContext["dataFromRequest"] = findKeysFromRequest(
          req,
          storyContext.pickDataFromRequest
        );
      } else {
        executionContext["dataFromRequest"] =
          await storyContext.pickDataFromRequest(executionContext);
      }

      // End -- Pick Data From Request

      // Start -- Prepare Data

      let inputPayload = await storyContext.prepareInput(executionContext);

      // End -- Prepare Data

      executionContext["inputPayload"] = inputPayload;

      let isUserAuthorized = true;

      if (storyContext.authorizeUser) {
        if (typeof storyContext.authorizeUser === "boolean") {
          isUserAuthorized = storyContext.authorizeUser;
        } else {
          isUserAuthorized = await storyContext.authorizeUser(
            user,
            executionContext
          );
        }
      }

      // debugLogger("isUserAuthorized", isUserAuthorized);

      if (isUserAuthorized) {
        let inputIsValid = true;

        if (storyContext.validateInput) {
          if (typeof storyContext.validateInput === "boolean") {
            inputIsValid = storyContext.validateInput;
          } else {
            inputIsValid = await storyContext.validateInput(
              inputPayload,
              executionContext
            );
          }
        }

        if (inputIsValid) {
          const outputPayload = await storyContext.run(
            inputPayload,
            executionContext
          );

          const finalResult = await storyContext.generateOutput(
            outputPayload,
            executionContext
          );

          return finalResult;
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
