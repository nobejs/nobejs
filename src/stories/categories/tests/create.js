const httpServer = requireHttpServer();
const randomUser = requireUtil("randomUser");
const contextClassRef = require("./ContextHelper");

module.exports = () => {
  beforeAll(() => {
    contextClassRef.user = randomUser();
    contextClassRef.headers = {
      Authorization: `Bearer ${contextClassRef.user.token}`,
    };
  });

  describe("create multiple categories for same user", () => {
    it("User can create category", async () => {
      const app = httpServer();

      const payload = {
        name: "Category 1",
      };

      const response = await app.inject({
        method: "POST",
        url: "/categories",
        payload,
        headers: contextClassRef.headers,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject(payload);
    });

    it("User can create another category", async () => {
      const app = httpServer();

      const payload = {
        name: "Category 2",
      };

      const response = await app.inject({
        method: "POST",
        url: "/categories",
        payload,
        headers: contextClassRef.headers,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject(payload);
    });

    it("User can get created categories", async () => {
      const app = httpServer();

      const response = await app.inject({
        method: "GET",
        url: "/categories",
        headers: contextClassRef.headers,
      });

      //   console.log("response.json()", response.json());

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject([
        {
          name: "Category 1",
        },
        {
          name: "Category 2",
        },
      ]);
    });
  });
};
