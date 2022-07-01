https://www.sanity.io/docs/array-type

- posts
- authors
- categories
- post_categories (post_id, category_id)

---

Backend Server stands as a Gateway between your frontend and database, it has go through following everytime an API is called:

1. Understand the Request
2. Collect required data from Request (Apply Mutators if needed)
3. Understand which application is making the Request
4. Check if "whoever" is making this request is allowed
5. Prepare queries to be made on database - sql, no sql etc.,
6. Fetch the data
7. Apply accessors if needed
8. Respond

---

Mental
