const testStory = requireTestStory();
const Category = requireRepo("category");

describe("test userCanCreateCategory Story", () => {
  beforeAll(async () => {});

  it("create category for a user", async () => {
    let categoriesCount = 0;
    try {
      const user = "462df6fc-1dd8-11ec-9621-0242ac130002";

      const input = {
        name: "Category 1",
      };

      await testStory("categories/userCanCreateCategory", input, user);

      categoriesCount = await Category.countAll({
        user_uuid: "462df6fc-1dd8-11ec-9621-0242ac130002",
      });
    } catch (error) {
      console.log("create category for a user", error);
    }

    expect(categoriesCount).toBe(1);
  });

  it("can create another category for a user", async () => {
    let categoriesCount = 0;
    try {
      const user = "462df6fc-1dd8-11ec-9621-0242ac130002";

      const input = {
        name: "Category 2",
      };

      await testStory("categories/userCanCreateCategory", input, user);

      categoriesCount = await Category.countAll({
        user_uuid: "462df6fc-1dd8-11ec-9621-0242ac130002",
      });
    } catch (error) {
      console.log("can create another category for a user", error);
    }
    expect(categoriesCount).toBe(2);
  });

  it("cannot create category with same name for user", async () => {
    const user = "462df6fc-1dd8-11ec-9621-0242ac130002";

    const input = {
      name: "Category 1",
    };

    let output = {};

    try {
      await testStory("categories/userCanCreateCategory", input, user);
    } catch (error) {
      output = error;
    }

    expect(output).toEqual(
      expect.objectContaining({
        errorCode: expect.stringMatching("InputNotValid"),
      })
    );
  });
});
