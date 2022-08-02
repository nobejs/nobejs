const authorize = (context) => {
  const { mentalAction } = context;

  const requiredBasicPermission = `${mentalAction.action}_${mentalAction.resource}`;

  if (
    mentalAction.permissions !== "*" &&
    !mentalAction.permissions.includes(requiredBasicPermission)
  ) {
    throw {
      statusCode: 403,
      message: "Forbidden",
    };
  }

  return context;
};

module.exports = authorize;
