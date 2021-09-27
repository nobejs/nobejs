const single = require("./single");

module.exports = (categories) => {
  let result = categories.map((c) => {
    return single(c);
  });
  return result;
};
