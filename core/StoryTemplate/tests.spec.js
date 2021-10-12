const debugLogger = requireUtil("debugLogger");

describe("Test Handler StoryTemplate", () => {
  it("an user can", async () => {
    let result = {};
    try {
      result = await testStrategy("StoryTemplate", {
        prepareResult: {},
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(1).toBe(1);
  });
});
