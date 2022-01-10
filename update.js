require("./config");
const fs = require("fs-extra");
const url = require("url");
const path = require("path");
const https = require("https");
const httpsRequestPromise = requireUtil("httpsRequestPromise");
var extractZip = require("extract-zip");
const localRmSync = fs.rmSync === undefined ? fs.unlinkSync : fs.rmSync;

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

const updateRelease = (options) => {
  if (fs.existsSync("upgrade-nobejs")) {
    localRmSync("upgrade-nobejs", { recursive: true });
  }

  if (!fs.existsSync("upgrade-nobejs")) {
    fs.mkdirSync("upgrade-nobejs");
  }

  return new Promise((resolve, reject) => {
    https
      .get(options, function (res1) {
        console.log("Release Asset:", res1.headers.location);

        // res1.pipe(dest);

        https
          .get(res1.headers.location, function (res2) {
            console.log(
              "res2.header"
              //   res2.headers,
            );
            var filename = res2.headers["content-disposition"].replace(
              "attachment; filename=",
              ""
            );

            var destf = path.join("upgrade-nobejs", filename);
            var dest = fs.createWriteStream(destf);

            var total = parseInt(res2.headers["content-length"]);
            // console.log("total", total);
            var completed = 0;
            res2.pipe(dest);
            res2.on("data", function (data) {
              completed += data.length;
              //   console.log("completed", (completed / total) * 100);
            });
            res2.on("error", () => {
              console.log(error.message);
            });
            res2.on("end", async () => {
              console.log("Download to:", destf);
              try {
                const extractionResult = await extractZip(destf, {
                  dir: path.resolve("upgrade-nobejs/release"),
                });
                let releaseFiles = fs.readdirSync(
                  path.resolve("upgrade-nobejs/release")
                );
                console.log(
                  "Extracted release.zip into folder release: with name:",
                  releaseFiles[0]
                );

                console.log(
                  "Copy What: ",
                  path.resolve(`upgrade-nobejs/release/${releaseFiles[0]}/core`)
                );

                console.log("Copy: To", path.resolve(`core`));

                fs.moveSync(path.resolve(`core`), path.resolve(`core_bk`));
                fs.moveSync(
                  path.resolve(
                    `upgrade-nobejs/release/${releaseFiles[0]}/core`
                  ),
                  path.resolve(`core`)
                );

                fs.copySync(
                  path.resolve(
                    `upgrade-nobejs/release/${releaseFiles[0]}/update.js`
                  ),
                  path.resolve(`update.js`)
                );

                console.log("Self Update the update script");

                localRmSync("upgrade-nobejs", { recursive: true });
                localRmSync("core_bk", { recursive: true });
              } catch (err) {
                localRmSync("core", { recursive: true });
                fs.moveSync(path.resolve(`core_bk`), path.resolve(`core`));

                console.log("err", err);
              }
            });
          })
          .on("error", () => {});
      })
      .on("error", (error) => {
        console.log("Go crazy", error);
      });
  });
};

(async () => {
  try {
    let response = await httpsRequestPromise(releaseOptions);
    console.log("Latest Release:", response.zipball_url);

    var zipBallOptions = Object.assign({}, url.parse(response.zipball_url), {
      headers: {
        "User-Agent": "nobejs",
      },
    });

    await updateRelease(zipBallOptions);
  } catch (error) {
    console.log("error", error);
  }
})();
