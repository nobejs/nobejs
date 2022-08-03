var validate = require("validate.js");
const knex = requireKnex();

validate.validators.outside_function = function (
  value,
  options,
  key,
  attributes,
  constraints
) {
  return new validate.Promise(async function (resolve, reject) {
    try {
      try {
        let result = await options.custom_validator(value, options);

        if (result === true) {
          return resolve();
        } else {
          return resolve(result);
        }
      } catch (error) {
        throw error;
      }
    } catch (error) {
      resolve("^" + "something went wrong, couldn't validate");
    }
  });
};

validate.validators.exists = function (
  value,
  options,
  key,
  attributes,
  constraints
) {
  return new validate.Promise(async function (resolve, reject) {
    try {
      let count = 0;

      try {
        let rows = await knex(options.table)
          .where(options.where)
          .whereNot(options.whereNot)
          .whereNull("deleted_at")
          .count({ count: "*" })
          .first();
        count = parseInt(rows.count);
      } catch (error) {
        throw error;
      }

      if (count > 0) {
        return resolve();
      }

      return resolve("^" + options["message"]);
    } catch (error) {
      console.log("error", error);
      resolve("^" + options["message"]);
    }
  });
};

validate.validators.unique = function (
  value,
  options,
  key,
  attributes,
  constraints
) {
  return new validate.Promise(async function (resolve, reject) {
    try {
      let count = 0;

      try {
        let rows = await knex(options.table)
          .where(options.where)
          .whereNot(options.whereNot)
          .whereNull("deleted_at")
          .count({ count: "*" })
          .first();
        count = parseInt(rows.count);
      } catch (error) {
        throw error;
      }

      if (count === 0) {
        return resolve();
      }

      return resolve("^" + options["message"]);
    } catch (error) {
      console.log("error", error);
      resolve("^" + options["message"]);
    }
  });
};

validate.validators.custom_callback = function (
  value,
  options,
  key,
  attributes,
  constraints
) {
  return new validate.Promise(async function (resolve, reject) {
    try {
      let result = await options["callback"].apply(null, [
        constraints["payload"],
      ]);

      if (result === true) {
        return resolve();
      }
      return resolve("^" + options["message"]);
    } catch (error) {
      resolve("^" + options["message"]);
    }
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
