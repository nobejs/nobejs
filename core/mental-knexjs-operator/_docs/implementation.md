We write APIs and UIs everyday. Some part of it is repetitive. We wanted to remove what's repetitive. We wanted to make new things also repetitive. We needed a framework to do it any programming language. We needed peace.

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
mental.execute("create_resource", "post", data, scopes);
```

The signature of above function is:

- function to perform
- resource name
- data
- scopes

#### Validation

The very first thing mental would do is validate the data, validation is one of the very core operations performed by Mental. If not for anything, you might use Mental just for validation.

Usually validation rules are specified for each attribute.

There are many "kinds" of validation which mental performs:

- Perform validation on all attributes for create, update functions
- Perform conditional validation for a single attribute in case of patch functions
- Some attributes validation is performed based on other attributes and it's values
-

#### Authorization

Mental won't work without AuthZ. It needs to know very clearly if it has scopes to execute something which it's being asked to.

```js
mental.execute("create_resource", "post", data, scopes);
```

Let's say your API is a backend is for medium. Medium has users, and posts are linked to those users. When we call `GET /posts` it's not supposed to fetch all posts, but only those posts to which this user has access. How would you implement this?

- No user except admin can call /posts?
- Find logged in user and add it as an additional where clause

How would Mental know! It has a dedicated section to specify this:

```
- To create_post, you need to have "create_post" or "create_posts" permission
- But the permission itself should be very clear

team_uuid is a column in table, basically, this user has a default value for this column. So, authZ should clearly declare that.

```

#### Relationships

- one_to_one
  - 2 tables (post has one author)
- one_to_many
  - 2 tables (post has many comments)
- many_to_many
  - 3 tables (a post has many categories, a category has many posts)

```
authors
-----
uuid
name
status
created_at
updated_at

posts
-----
uuid
title
body
published_at
author_uuid
created_at
updated_at
deleted_at

comments
------
uuid
comment
post_uuid
author_uuid
created_at
updated_at
deleted_at

categories
-----
uuid
title
created_at
updated_at
deleted_at

posts_categories
------
post_uuid
category_uuid
created_at

```

## Functions

### get_resource

"get_resource" basically fetches data related one resource

- `SELECT * FROM resource WHERE uuid = <uuid> LIMIT 1`
- The above is called, "get_first_with_where", basically prepare a "where" query and return the first item
- get_resources
- create_resource
- create_resources
- update_resource
- update_resources
- patch_resource
- patch_resources
- delete_resource
- delete_resources
