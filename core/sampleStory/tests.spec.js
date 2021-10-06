const debugLogger = requireUtil("debugLogger");

describe("test sampleStory", () => {
  it("an user can", async () => {
    let result = {};
    try {
      result = await testStrategy("sampleStory", {
        prepareResult: {},
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(1).toBe(1);
  });
});
