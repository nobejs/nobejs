function toType(a) {
  // Get fine type (object, array, function, null, error, date ...)
  return {}.toString.call(a).match(/([a-z]+)(:?\])/i)[1];
}

function isDeepObject(obj) {
  return "Object" === toType(obj);
}

function deepAssign(
  options = { nonEnum: true, symbols: true, descriptors: true, proto: true }
) {
  return function deepAssignWithOptions(target, ...sources) {
    sources.forEach((source) => {
      if (!isDeepObject(source) || !isDeepObject(target)) return;

      // Copy source's own properties into target's own properties
      function copyProperty(property) {
        const descriptor = Object.getOwnPropertyDescriptor(source, property);
        //default: omit non-enumerable properties
        if (descriptor.enumerable || options.nonEnum) {
          // Copy in-depth first
          if (isDeepObject(source[property]) && isDeepObject(target[property]))
            descriptor.value = deepAssign(options)(
              target[property],
              source[property]
            );
          //default: omit descriptors
          if (options.descriptors)
            Object.defineProperty(target, property, descriptor);
          // shallow copy descriptor
          else target[property] = descriptor.value; // shallow copy value only
        }
      }

      // Copy string-keyed properties
      Object.getOwnPropertyNames(source).forEach(copyProperty);

      //default: omit symbol-keyed properties
      if (options.symbols)
        Object.getOwnPropertySymbols(source).forEach(copyProperty);

      //default: omit prototype's own properties
      if (options.proto)
        // Copy souce prototype's own properties into target prototype's own properties
        deepAssign(Object.assign({}, options, { proto: false }))(
          // Prevent deeper copy of the prototype chain
          Object.getPrototypeOf(target),
          Object.getPrototypeOf(source)
        );
    });
    return target;
  };
}

module.exports = deepAssign;
