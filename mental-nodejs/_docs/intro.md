Your backend and frontend coordinate to give User a GUI to operate on Data. Data or Resource is a logical representation of a business concept. A Blog Post with Categories and an Author - In this case, Blog Post is a resource.

User would usually run operation on this Resource like:

1. Create Resource
2. Update Resource
3. Delete Resource
4. View Resource
5. Search Resources

The data of the above resource is "persisted" in some kind of database. There are variety of databases like SQL, NoSQL. Even then, it doesn't matter to user, because at the end of the day, user wants to perform operations on resources, and hopes it's actually done.

The resource structure pretty much stays the same. A resource is nothing but "attributes" - Attributes can be collection of strings, dates, files, combination of some attributes, other attributes. There are no ground rules set. If a user wants to update categories for a Blog post, it doesn't matter how the database schema is structured.

- string
- date
- text
- json object
- json array
- relatives (which are nothing but references to other resources)

## Spec

> This spec is written in form of "expectations".

- A Resource is defined in an JSON format, in a json file.
- Each resource is uniquely identified by a "name" (which allowes no spaces and special characters)

### Operations

- A resources can defined what operations can be performed on it, but the "operation" itself is tightly defined concept in Mental Spec
  - Simple put, an operation is a combination of "<HTTPVERB> <URI>"
  - Mental supports some default operations as soon a resource is defined, if we assume name of the resource is "posts"
    - "GET /posts"
    - "POST /posts"
    - "PUT /posts/:id"
    - "GET /posts/:id"
    - "DELETE /posts/:id"
    - "PATCH /posts/:id"
  - You can introduce new operations.
- Irrespective of what operation it is, Mental always translates above operations to one of the following database operations. For very clear understanding, we use terminology of an SQL Database.
  - SELECT
  - INSERT
  - UPDATE
  - DELETE
- In that sense, if you define a new operation, you also need to tell Mental what database operations you are expecting it to perform. But the idea is the default supported operations will handle anything you throw at it.

### Attributes

- Attributes are what make up a Resource. But you shouldn't not think of Resources as Database Tables, that way you won't think of attributes as columns.
- Resource actually is an ORM representation = Columns + Relationships
- But Mental let's you control each Attribute granularly, something to a level that it feels Overwhelming
- You can control following on Attribute level:
  - What operations are allowed, denied on this attribute
  - What permissions are needed to perform an operation on this attribute (In this case the operations would be as simple as read, modify)
  - How to validate this attribute
    - Note that the validation of this attribute might depend on some other attributes too

### Hooks & Events

- Before and after an operation is performed, Mental implementation is expected to give hooks
- A good implementation of Hook would also fire events to a store and save them

### Audit

- An implementation of Mental should handle Auditing (Storing all the revisions made to the data)

### Cache

- An implementaion of Mental should by default Cache responses, so that performence comes first

### Authorization

- An implementation of Mental should make security explicit, for each operation and for each attributes, allow/deny rules should be set. This gives extreme security at the cheapest cost.

The spirit of Mental is simple, we are in an age where we need to work as a team. If an enterprise implements great features because it's able to afford and if a startup is not able to do it, the sum is at last in negative. We have to uplift all developers to deliver APIs/Features at same level if possible and that too with least effort and cost. So that, our brains energy is spent on Innovation - and not just generations learning what our before generations learned. At some point, the learning itself would become so high, that producing takes more time. And we would be entering a world of unfair advantage to people who start before others. First of all, this is not a race. It's on everyone to uplift everyone.

Every system developed should be as robust and secure, efficient as possible - And this should be possible in a linear cost, not exponential cost.

---

## Implementation:

- An implementation boils down pretty much to performing a series of steps in form of a flow chart.

- Operation is simple identified by a sense making string like: "create_posts"
- But mental by default doesn't understand what to do in this operation
- So, you need to define it, and defining is nothing but:
  - Prepare the input
  - Run queries against database
  - Prepare the output
- The API exposed as "GET /posts" -> is actually an operation which maps to "get_resources", the perform above operation, Mental goes through following:
  - Prepate the Input
    - Let's assume there are no filters etc., needed
  - Run queries
    - Go through the attributes to understand which tables and columns to query
    - Run `SELECT * FROM posts`
  -

---

## R&D

`"GET /posts"`

Schema

```
posts

uuid
title
slug
created_at
updated_at

categories

uuid
title
slug

posts_categories

post_uuid
category_uuid
```

Scenario 1: Posts with default ordering and pagination

- resource json should contain following:
  - table name
  - per_page
  - default ordering (column and sorting)
  - column names
- Exclude all relationships
- `SELECT columns FROM posts ORDER BY column sort LIMIT 10;`

Scenario 2: Posts with user requested ordering

- resource json should contain following:
  - table name
  - per_page
  - default ordering (column and sorting)
  - column names
- request should contain
  - sort_columns
  - sort_orders
- `SELECT columns FROM posts ORDER BY column1 sort1 column2 sort2;`

Scenario 3: Posts with filters

- resource json should contain following:
  - table name
  - per_page
  - default ordering (column and sorting)
  - column names
- request should contain
  - filters (column, value)
- `SELECT columns FROM posts WHERE column LIKE value;`

Scenario 4: Posts with Categories

- resource json should contain following:
  - table name
  - per_page
  - default ordering (column and sorting)
  - column names
  - relationship to categories
    - many_to_many
    - pivot_table
    - resource name
- `SELECT columns FROM posts ORDER BY column sort LIMIT 10;`
- `SELECT columns FROM pivot_table JOIN other resource_table;`

Scenario 5: Posts with Filter on Categories

- resource json should contain following:
  - table name
  - per_page
  - default ordering (column and sorting)
  - column names
  - relationship to categories
    - many_to_many
    - pivot_table
    - resource name
- request should contain
  - filters (category name, value)
- `SELECT columns FROM pivot_table JOIN other resource_table WHERE name LIKE value;`
