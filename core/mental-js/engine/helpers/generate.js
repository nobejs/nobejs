var uuid = require("uuid");
const { resolveByDot } = require("./utils");

const generateOTP = async (length = 6) => {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const generateAttribute = async (
  context,
  identifier,
  value,
  generator,
  outsideGeneratorFunctions
) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  let payload = mentalAction.payload;
  const resourceSpec = resourceModels[mentalAction.resource];

  switch (generator.type) {
    case "uuid":
      value = uuid.v4();
      break;

    case "otp":
      let otpLength = generator.length || 6;
      value = generateOTP(otpLength);
      break;

    case "datetime":
      value = new Date().toISOString();
      break;

    case "custom_generator":
      value = await outsideGeneratorFunctions[generator["value"]](
        resourceSpec,
        identifier,
        payload[generator["source"]]
      );
      break;

    default:
      break;
  }

  return value;
};

const generate = async (context) => {
  const { mentalAction, resourceModels, mentalConfig } = context;
  const resourceSpec = resourceModels[mentalAction.resource];
  const attributes = resourceSpec.attributes;
  const outsideGeneratorFunctions = require(mentalConfig.generatorsPath);
  let payload = mentalAction.payload;
  let action = mentalAction.action;

  const attributesWithOperations = attributes.filter((a) => {
    return a.operations !== undefined;
  });

  let forIndex = 0;

  for (forIndex = 0; forIndex < attributesWithOperations.length; forIndex++) {
    const attribute = attributesWithOperations[forIndex];

    const operationKeys = Object.keys(attribute.operations);

    let generators = [];

    for (let index = 0; index < operationKeys.length; index++) {
      const operationKey = operationKeys[index];
      const operationActions = operationKey.split(",");
      if (operationActions.includes("*") || operationActions.includes(action)) {
        let attributeGens = resolveByDot(
          `operations.${operationKey}.generate`,
          attribute
        );

        if (Array.isArray(attributeGens) === false) {
          if (attributeGens !== undefined) {
            attributeGens = [
              {
                type: attributeGens,
              },
            ];
          }
        }

        // console.log("attributeGens", Array.isArray(attributeGens));

        if (attributeGens !== undefined) {
          // payload[attribute.identifier] = generateAttribute(
          //   attribute.operations[operationKey].generate
          // );
          generators = [...attributeGens];
        }
      }
    }

    if (generators.length > 0) {
      let value = undefined;
      // console.log("use generators", generators);
      for (let index = 0; index < generators.length; index++) {
        const generator = generators[index];
        value = await generateAttribute(
          context,
          attribute.identifier,
          value,
          generator,
          outsideGeneratorFunctions
        );
      }

      if (value !== undefined) {
        payload[attribute.identifier] = value;
      }
    }
  }

  mentalAction.payload = payload;
  context.mentalAction = mentalAction;
  return context;
};

module.exports = generate;
