Mental Specification is to stop doing the same things again and again in our backends and at the same time, make backends more predictable and efficient. Mental is a collection of guidelines, conventions, mechanisms and algorithsm to handle common use-cases which we face everyday in backend.

Instead of writing them in a programming language, the idea is that most of this backend logic should be specified in JSON formats, and Mental Engine (which is an implementation of Mental Spec in a particular programming language) can understand it.

You might write JSON docs and use them in a Mental Engine enabled NodeJS Framework, or Go Framework or Java Framework. Your JSON files stay the same and they encapsulate most of the logic if not everything. Your business logic is now Programming Language Agnostic.

Mental sounds like a dream, we started knowing how tough it is. But in the end, all good things take time and patience. And it seems worth it.

Mental will blow you away, once you get a hang of it, you will never go back to write so much code. You will love developing apps again because Mental takes your unnecessary stress and gives you back Mental space to do what matters - Focus on architecture!

When more times goes into architecture - and architecture is where it ends, without need to write code, that's magic.

---

First of all, What is Mental?

- Mental is a specification, That's it. Just like GraphQL is a specification. It suggests principles, standards, some algorithms on how to write APIs, build backends.
- But is a specification enough? Obviously not.
- You need implementation. But in which programming language?
- Implementation needs two parts:
  - Mental Engine (The actual implementation of Mental Spec)
  - The Output of Mental Engine is a list of actions which you can perform against you are persistence.
  - So, you need another implementation based on the database you have
  - So, we implemented, mental-knex (Which is implementation which will help you store in postgres, mysql etc.,)
