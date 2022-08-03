function noWhiteSpace(s) {
  return /\s/.test(s) ? "^whitespace is not allowed" : true;
}

module.exports = noWhiteSpace;
