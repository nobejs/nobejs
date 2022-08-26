const routes = ({ resourceModels, browserModels }, mentalConfig) => {
  const resources = Object.values(resourceModels);
  const browsers = Object.values(browserModels);
  const apiEndpoints = [];
  const mentalApiPrefix =
    mentalConfig.apiPrefix === undefined ? "/mental" : mentalConfig.apiPrefix;

  let crudPaths = [
    {
      method: "post",
      path: "/resource/$api_endpoint/_create",
      action: "create",
    },
    {
      method: "post",
      path: "/resource/$api_endpoint/_update",
      action: "update",
    },
    {
      method: "post",
      path: "/resource/$api_endpoint/_delete",
      action: "delete",
    },
    {
      method: "post",
      path: "/resource/$api_endpoint/_read",
      action: "read",
    },
    {
      method: "post",
      path: "/resource/$api_endpoint/_config",
      action: "crud_config",
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
        action: crudPath.action,
      });
    }
  }

  let browserPaths = [
    {
      method: "post",
      path: "/browser/$api_endpoint/_browse",
      action: "browse",
    },
    {
      method: "post",
      path: "/browser/$api_endpoint/_config",
      action: "browser_config",
    },
  ];

  for (
    let browserCounter = 0;
    browserCounter < browsers.length;
    browserCounter++
  ) {
    const browser = browsers[browserCounter];

    for (
      let browserPathCounter = 0;
      browserPathCounter < browserPaths.length;
      browserPathCounter++
    ) {
      const browserPath = browserPaths[browserPathCounter];

      apiEndpoints.push({
        browser: browser.name,
        method: browserPath.method,
        path:
          mentalApiPrefix +
          browserPath.path.replace("$api_endpoint", browser.name),
        action: browserPath.action,
      });
    }
  }

  return apiEndpoints;
};

module.exports = routes;
