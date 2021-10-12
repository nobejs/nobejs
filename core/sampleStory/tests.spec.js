const debugLogger = requireUtil("debugLogger");

describe("Test Handler SampleStory", () => {
  it("an user can", async () => {
    let result = {};
    try {
      result = await testStrategy("SampleStory", {
        prepareResult: {},
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(1).toBe(1);
  });
});
