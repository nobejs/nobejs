var validate = require("validate.js");

validate.validators.custom_callback = function (
  value,
  options,
  key,
  attributes,
  constraints
) {
  return new validate.Promise(async function (resolve, reject) {
    let result = await options["callback"].apply(null, [
      constraints["payload"],
    ]);

    if (result === true) {
      return resolve();
    }

    return resolve("^" + options["message"]);
  });
};

module.exports = (payload, constraints, pickOneError = false) => {
  return new Promise((resolve, reject) => {
    try {
      validate
        .async(payload, constraints, {
          payload: payload,
          format: "detailed",
        })
        .then(
          () => {
            resolve({});
          },
          (validateJsErrors) => {
            var response = {
              message: `Validation failed. ${validateJsErrors.length} error(s)`,
            };

            let errors = {};

            validateJsErrors.forEach((d) => {
              if (!errors[d.attribute]) {
                errors[d.attribute] = [];
              }
              errors[d.attribute].push(d.error);
            });

            if (pickOneError) {
              for (k in errors) {
                errors[k] = errors[k][0];
              }
            }

            response["errorCode"] = "InputNotValid";
            response["statusCode"] = 422;
            response["errors"] = errors;

            reject(response);
          }
        );
    } catch (error) {
      throw error;
    }
  });
};
