const validator = requireValidator();
const { resolveByDot } = require("./utils");

const validate = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const resourceSpec = resourceModels[mentalAction.resource];
  const attributes = resourceSpec.attributes;

  let payload = mentalAction.payload;
  let action = mentalAction.action;
  let forIndex = 0;
  const constraints = {};

  for (forIndex = 0; forIndex < attributes.length; forIndex++) {
    const attribute = attributes[forIndex];
    const validators = resolveByDot(`operations.${action}.validate`, attribute);
    if (validators) {
      constraints[attribute.identifier] = {};

      // console.log("validators", validators);

      for (let vCounter = 0; vCounter < validators.length; vCounter++) {
        const validator = validators[vCounter];
        if (validator.type === "required") {
          constraints[attribute.identifier]["presence"] = {
            allowEmpty: false,
            message: `^Please enter ${attribute.label}`,
          };
        }

        if (validator.type === "regex") {
          constraints[attribute.identifier]["format"] = {
            pattern: validator.value,
            message: `^Please enter valid ${attribute.label} matching ${validator.value}`,
          };
        }

        if (validator.type === "within") {
          constraints[attribute.identifier]["inclusion"] = {
            within: validator.value,
            message: `^Please choose valid type within ${JSON.stringify(
              validator.value
            )}`,
          };
        }

        if (validator.type === "unique") {
          let where = {};
          let whereNot = {};
          const includeAttributes = validator.includeAttributes;
          const excludeAttributes = validator.excludeAttributes;
          where[attribute.identifier] = payload[attribute.identifier];

          for (let index = 0; index < includeAttributes.length; index++) {
            const includeAttribute = includeAttributes[index];
            if (payload[includeAttribute]) {
              where[includeAttribute] = payload[includeAttribute];
            }
          }

          for (let index = 0; index < excludeAttributes.length; index++) {
            const excludeAttribute = excludeAttributes[index];
            if (payload[excludeAttribute]) {
              whereNot[excludeAttribute] = payload[excludeAttribute];
            }
          }

          constraints[attribute.identifier]["unique"] = {
            message: `${attribute.identifier} should be unique.`,
            table: validator.table,
            where: where,
            whereNot: whereNot,
          };
        }

        if (validator.type === "exists") {
          let where = {};
          let whereNot = {};
          const includeAttributes = validator.includeAttributes || [];
          const excludeAttributes = validator.excludeAttributes || [];
          where[validator.column || attribute.identifier] =
            payload[attribute.identifier];

          for (let index = 0; index < includeAttributes.length; index++) {
            const includeAttribute = includeAttributes[index];
            if (payload[includeAttribute]) {
              where[includeAttribute] = payload[includeAttribute];
            }
          }

          for (let index = 0; index < excludeAttributes.length; index++) {
            const excludeAttribute = excludeAttributes[index];
            if (payload[excludeAttribute]) {
              whereNot[excludeAttribute] = payload[excludeAttribute];
            }
          }

          constraints[attribute.identifier]["exists"] = {
            message: `${attribute.identifier} should exist.`,
            table: validator.table,
            where: where,
            whereNot: whereNot,
          };
        }
      }
    }
  }

  try {
    let validatorResult = await validator(payload, constraints);
  } catch (error) {
    throw error;
  }

  context.mentalAction = mentalAction;

  return context;
};

module.exports = validate;
