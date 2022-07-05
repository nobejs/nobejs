## Database Schema

```
teams
------
uuid
title
created_at
updated_at

authors
-----
uuid
team_uuid
name
status
created_at
updated_at

posts
-----
uuid
team_uuid
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
team_uuid
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

## Resources

### Authors

**resource spec**

- uuid
- name
- status
- posts (one_to_many)

**func::get_resource**

- `SELECT * FROM authors where uuid = <uuid>`
- `SELECT * FROM posts where author_uuid = <uuid>`
