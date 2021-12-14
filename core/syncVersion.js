require("../config");
const fs = require("fs-extra");
const path = require("path");

(async () => {
  const packageJsonFilePath = path.resolve(`package.json`);

  let packageFileContents = fs.readFileSync(packageJsonFilePath, "utf8");

  console.log("Current Version: ", JSON.parse(packageFileContents)["version"]);

  const versionMdFile = path.resolve(`core/VERSION.md`);

  fs.writeFileSync(versionMdFile, JSON.parse(packageFileContents)["version"]);
})();
