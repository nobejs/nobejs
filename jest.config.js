process.env.ENVFILE = ".env.jest";

module.exports = async () => {
  return {
    bail: true,
    verbose: true,
    testMatch: ["**/src/**/?(*.)+(spec|test).[jt]s?(x)"],
    setupFiles: ["./tests/jest-setup.js"],
    setupFilesAfterEnv: ["./tests/jest-after.js"],
    globalSetup: "./tests/global-setup.js",
    globalTeardown: "./tests/global-teardown.js",
  };
};
