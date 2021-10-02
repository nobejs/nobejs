require("../config");
const httpsRequestPromise = requireUtil("httpsRequestPromise");

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

  console.log("Version: 0.0.8");
  console.log("Make sure you created a file called global.js, which is introduced in this release");

  try {
    let response = await httpsRequestPromise(releaseOptions);
    console.log("Latest Available Version:", response.tag_name);
  } catch (error) {
    console.log("Couldn't fetch Latest Version:", error.message);
  }
})();
