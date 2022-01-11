const amqp = require("amqplib");
const Sentry = require("@sentry/node");

const rabbitReceiveMessage = async (amqp_endpoint, q, storyName) => {
  var conn;
  try {
    console.log("Listen to:", q);
    conn = await amqp.connect(amqp_endpoint);
    const ch = await conn.createChannel();
    var ok = await ch.assertQueue(q, { durable: true });
    ch.consume(q, async (msg) => {
      if (msg !== null) {
        try {
          await queueJobStrategy(storyName, {
            job: JSON.parse(msg.content.toString()),
          });
          await ch.ack(msg);
        } catch (error) {
          if (process.env.SENTRY_DSN !== "" && process.env.DEBUG !== "true") {
            Sentry.captureException(error);
          }

          if (process.env.DEBUG === "true") {
            console.log("rabbitReceiveMessage:error", error);
          }

          if (error.ack) {
            await ch.ack(msg);
          }
        }
      }
    });
  } catch (error) {
    throw error;
  } finally {
  }
};

module.exports = rabbitReceiveMessage;
