module.exports = (handlerFunctions, shouldInclude = []) => {
  let collectErrors = [];

  shouldInclude.forEach((f) => {
    if (!handlerFunctions.includes(f) && f.charAt(0) !== "*") {
      collectErrors.push(f);
    }
  });

  return collectErrors;
};
