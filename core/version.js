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

  console.log("Version: 0.0.21");

  try {
    let response = await httpsRequestPromise(releaseOptions);
    console.log("Latest Available Version:", response.tag_name);
  } catch (error) {
    console.log("Couldn't fetch Latest Version:", error.message);
  }
})();
