require("../config");
const httpsRequestPromise = requireUtil("httpsRequestPromise");
const fs = require("fs-extra");
const path = require("path");

(async () => {
  const releaseOptions = {
    hostname: "api.github.com",
    port: 443,
    path: "/repos/nobejs/nobejs/releases/latest",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "request",
    },
  };

  const packageJsonFilePath = path.resolve(`package.json`);

  let packageFileContents = fs.readFileSync(packageJsonFilePath, "utf8");

  console.log("Current Version: ", JSON.parse(packageFileContents)["version"]);

  try {
    let response = await httpsRequestPromise(releaseOptions);
    console.log("Latest Available Version:", response.tag_name);
  } catch (error) {
    console.log("Couldn't fetch Latest Version:", error.message);
  }
})();
