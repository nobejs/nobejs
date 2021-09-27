module.exports = (handlerFunctions, shouldInclude = []) => {
  let collectErrors = [];

  shouldInclude.forEach((f) => {
    if (!handlerFunctions.includes(f)) {
      collectErrors.push(f);
    }
  });

  return collectErrors;
};
