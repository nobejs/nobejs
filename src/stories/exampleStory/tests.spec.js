describe("test exampleStory", () => {
  it("sum of 1 and 2 is 3", async () => {
    let result = {};
    try {
      result = await testStrategy("exampleStory", {
        prepareResult: {
          a: 1,
          b: 2,
        },
      });
    } catch (error) {
      console.log(error);
    }
    const { respondResult } = result;
    expect(respondResult.sum).toBe(3);
  });

  it("sum of 1 and 2 is not 4", async () => {
    let result = {};
    try {
      result = await testStrategy("exampleStory", {
        prepareResult: {
          a: 1,
          b: 2,
        },
      });
    } catch (error) {
      console.log(error);
    }
    const { respondResult } = result;
    expect(respondResult.sum).not.toBe(4);
  });
});
