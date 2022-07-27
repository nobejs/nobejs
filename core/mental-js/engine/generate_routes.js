const routes = (models, mentalConfig) => {
  const resources = Object.values(models);
  const apiEndpoints = [];
  const mentalApiPrefix =
    mentalConfig.apiPrefix === undefined ? "/mental" : mentalConfig.apiPrefix;

  let crudPaths = [
    {
      method: "post",
      path: "/$api_endpoint/_create",
      operation: "create",
    },
    {
      method: "post",
      path: "/$api_endpoint/_update",
      operation: "update",
    },
    {
      method: "post",
      path: "/$api_endpoint/_delete",
      operation: "delete",
    },
    {
      method: "post",
      path: "/$api_endpoint/_read",
      operation: "read",
    },
  ];

  for (
    let resourceCounter = 0;
    resourceCounter < resources.length;
    resourceCounter++
  ) {
    const resource = resources[resourceCounter];

    for (
      let crudPathCounter = 0;
      crudPathCounter < crudPaths.length;
      crudPathCounter++
    ) {
      const crudPath = crudPaths[crudPathCounter];

      apiEndpoints.push({
        resource: resource.name,
        method: crudPath.method,
        path:
          mentalApiPrefix +
          crudPath.path.replace("$api_endpoint", resource.name),
        operation: crudPath.operation,
      });
    }
  }

  return apiEndpoints;
};

module.exports = routes;
