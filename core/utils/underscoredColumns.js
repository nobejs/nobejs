module.exports = (columns) => {
  return columns.map((c) => `${c} as ${c.replace(/[.]/g, "*")}`);
};
