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

  console.log("Version: 0.0.18");
  console.log("Release Notes: 0.0.15");
  console.log(
    "As part of 0.0.15, We added a dockerfile, and you want to compare server.js file for a critical change."
  );
  console.log("------> Release Notes: 0.0.17");
  console.log(
    "Remove the sample story from stories. Removed sample endpoint from endpoints.js file. yarn nobe:genstory works much better."
  );

  try {
    let response = await httpsRequestPromise(releaseOptions);
    console.log("Latest Available Version:", response.tag_name);
  } catch (error) {
    console.log("Couldn't fetch Latest Version:", error.message);
  }
})();
