var nJwt = require("njwt");
var uuid = require("uuid");
// const { validate, version } = require("uuid");

// function uuidValidateV4(uuid) {
//   return validate(uuid) && version(uuid) === 4;
// }

const generateToken = (sub = uuid.v4()) => {
  var claims = {
    sub,
  };

  var jwt = nJwt.create(claims, "we-dont-care-cuz-this-is-only-for-testing");

  var token = jwt.compact();

  return {
    user_uuid: sub,
    token: token,
  };
};

if (uuid.validate(process.argv[2])) {
  let result = generateToken(process.argv[2], true);
  console.log(result);
}

if (!process.argv[2]) {
  let result = generateToken();
  console.log(result);
}

module.exports = generateToken;
