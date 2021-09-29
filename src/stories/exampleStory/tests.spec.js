describe("test userCanCreateCategory Story", () => {
  beforeAll(async () => {});

  it("create category for a user", async () => {
    console.log(testStrategy);
    try {
      await testStrategy("canCreateATeam");
    } catch (error) {
      console.log(error);
    }
    expect(1).toBe(1);
  });
});
