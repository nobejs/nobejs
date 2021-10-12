const contextClassRef = requireUtil("contextHelper");
const randomUser = requireUtil("randomUser");
const knex = requireKnex();
const httpServer = requireHttpServer();

describe("Test API StoryTemplate", () => {
  beforeAll(async () => {
    contextClassRef.user = randomUser();
    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.user.token}`, // An authenticated user is making the api call
    };
  });

  it("dummy_story_which_will_pass", async () => {
    let respondResult;
    try {
      const app = httpServer();

      const payload = {};

      // respondResult = await app.inject({
      //   method: "POST",
      //   url: "/api_endpoint", // This should be in endpoints.js
      //   payload,
      //   headers,
      // });
    } catch (error) {
      respondResult = error;
    }

    // expect(respondResult.statusCode).toBe(200);
    // expect(respondResult.json()).toMatchObject({});
    expect(1).toBe(1);
  });
});
