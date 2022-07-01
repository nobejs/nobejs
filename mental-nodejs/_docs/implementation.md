To integrate Mental into your framework, you need to use mental nodejs sdk and write some code which acts as a bridge into your framework.

`yarn add @teurons/mental-nodejs`

- Create a folder for resources and add resources to it
- Call `mentalEngine.init(pathToResources)` as soon as possible (Preferable in server.js)
- Depending on your framework you have to load routes
  - You can do that by calling `mentalEngine.routes()`
- When a route is called with a payload, it would be executed
- You have to call corresponding mental method, which will give you dbOperations to perform
- Couple of reasons why you should call mental methods yourself, and your router directly won't call them are:
  - Mental doesn't know how to take payload from your "request" object which defers depending on framework
  - Mental doesn't know how to run database queries against database, though it generally understands what operations should be done one database
  - Though mental also gives custom implementations for some frameworks and databases, but it's an implementation is what it is, the implementation itself doesn't reflect the core engine's logic

When you declare a resource, mental provides following functions on that resource:

- get_resource
- get_resources
- create_resource
- create_resources
- update_resource
- update_resources
- patch_resource
- patch_resources
- delete_resource
- delete_resources

When an api endpoint is called, you should ask mental to execute one of above functions, and in return after validating the data, it will give you back db operations to perform. Once you execute db operations, you can again execute one of the above functions to get back data in a serialized format.

You would call mental to execute the function in following way:

```js
mental.execute("create_resource", "post", data);
```

The signature of above function is:

- function to perform
- resource name
- data

The very first thing mental would do is validate the data, validation is one of the very core operations performed by Mental. If not for anything, you might use Mental just for validation.

Usually validation rules are specified for each attribute.

There are many "kinds" of validation which mental performs:

- Perform validation on all attributes for create, update functions
- Perform conditional validation for a single attribute in case of patch functions
- Some attributes validation is performed based on other attributes and it's values
-
