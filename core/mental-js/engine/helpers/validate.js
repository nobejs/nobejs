const validator = requireValidator();
const { resolveByDot } = require("./utils");

const addToConstraints = (
  constraints,
  attribute,
  validators,
  context,
  outsideValidatorFunctions
) => {
  const { mentalAction } = context;
  let payload = mentalAction.payload;
  let action = mentalAction.action;

  constraints[attribute.identifier] = {};

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

      // if (action === "update") {
      //   validator.excludeAttributes = [
      //     ...mentalAction.primaryColumns,
      //     ...validator.excludeAttributes,
      //   ];

      //   validator.excludeAttributes = [...new Set(validator.excludeAttributes)];
      // }

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

    if (validator.type === "custom_validator") {
      validator["custom_validator"] =
        outsideValidatorFunctions[validator.value];
      constraints[attribute.identifier]["outside_function"] = validator;
    }
  }

  return constraints;
};

const validate = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const resourceSpec = resourceModels[mentalAction.resource];
  const attributes = resourceSpec.attributes;
  const outsideValidatorFunctions = require(mentalConfig.validatorsPath);

  const attributesWithOperations = attributes.filter((a) => {
    return a.operations !== undefined;
  });

  let payload = mentalAction.payload;
  let action = mentalAction.action;
  let forIndex = 0;
  let constraints = {};

  // console.log("payload", action, payload);

  for (forIndex = 0; forIndex < attributesWithOperations.length; forIndex++) {
    const attribute = attributesWithOperations[forIndex];
    const operationKeys = Object.keys(attribute.operations);

    let validators = [];

    for (let index = 0; index < operationKeys.length; index++) {
      const operationKey = operationKeys[index];
      const operationActions = operationKey.split(",");
      if (operationActions.includes("*") || operationActions.includes(action)) {
        if (resolveByDot(`operations.${operationKey}.validate`, attribute)) {
          validators = [
            ...validators,
            ...resolveByDot(`operations.${operationKey}.validate`, attribute),
          ];
        }
      }
    }

    if (validators) {
      constraints = addToConstraints(
        constraints,
        attribute,
        validators,
        context,
        outsideValidatorFunctions
      );
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
