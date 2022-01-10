const Sentry = require("@sentry/node");

if (process.env.SENTRY_DSN !== "") {
  Sentry.init({
    environment: process.env.SENTRY_ENVIRONMENT,
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

module.exports = (err, req, res) => {
  if (err.statusCode) {
    let statusCode = err.statusCode;
    delete err.statusCode;
    return res.status(statusCode).send(err);
  }

  if (process.env.DEBUG === "true") {
    return res.status(500).send({ message: err.message });
  } else {
    if (process.env.SENTRY_DSN !== "") {
      Sentry.captureException(err);
    }
    return res.status(500).send({ message: "Something went wrong" });
  }
};
