function debugLogger(...messages) {
  let enableLogs = false;

  if (process.env.DEBUG === "true") {
    enableLogs = true;
  }

  if (enableLogs) {
    console.log(...messages);
  }
}

module.exports = debugLogger;
