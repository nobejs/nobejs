const validator = requireValidator();

const validate = async (resourceModels, resource, payload) => {
  const constraints = {};
  let resourceSpec = resourceModels[resource];
  const attributes = resourceSpec["attributes"];

  for (let aCounter = 0; aCounter < attributes.length; aCounter++) {
    const attribute = attributes[aCounter];
    if (attribute.validators && attribute.validators.length) {
      constraints[attribute.name] = {};
      for (
        let vCounter = 0;
        vCounter < attribute.validators.length;
        vCounter++
      ) {
        const validatorType = attribute.validators[vCounter];
        if (validatorType === "required") {
          constraints[attribute.name]["presence"] = {
            allowEmpty: false,
            message: `^Please enter ${attribute.name}`,
          };
        }
      }
    }
  }

  // console.log("constraints", constraints);

  return validator(payload, constraints);
};

module.exports = validate;
