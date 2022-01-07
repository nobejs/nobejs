const https = require("https");
const http = require("http");

module.exports = (options) => {
  const networkProtocol = options.protocol === "http:" ? http : https;

  return new Promise((resolve, reject) => {
    const req = networkProtocol.request(options, (res) => {
      res.setEncoding("utf8");
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode <= 300) {
          resolve(JSON.parse(responseBody));
        } else {
          reject({ ...JSON.parse(responseBody), statusCode: res.statusCode });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
};
