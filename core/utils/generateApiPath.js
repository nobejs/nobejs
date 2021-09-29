module.exports = (api, endpoint) => {
  let apiPaths = [];
  if (api.apiPrefix !== undefined) {
    apiPaths.push(api.apiPrefix);
  }
  if (endpoint[1] !== "/") {
    apiPaths.push(endpoint[1]);
  }
  apiPaths = apiPaths.map((p) => {
    return p.replace(/^\//, "").replace(/\/$/, "");
  });

  return "/" + apiPaths.join("/");
};
