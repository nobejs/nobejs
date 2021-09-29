const prepare = (p1) => {
  //   console.log("prepare", p1);
};

const authorize = (p1) => {
  return "rajiv";
};

const handle = (context) => {
  //   console.log("handle", context);
  return { status: "ok" };
};

const respond = (context) => {
  //   console.log("respond", context);
  return { status: "respond" };
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
