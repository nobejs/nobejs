const amqp = require("amqplib");

const rabbitSendMessage = (amqp_endpoint, q, message) => {
  return new Promise(async (resolve, reject) => {
    var conn;
    try {
      conn = await amqp.connect(amqp_endpoint);
      const ch = await conn.createChannel();
      var assertOk = await ch.assertQueue(q, { durable: true });
      var ok = await ch.sendToQueue(q, Buffer.from(message), {
        persistent: true,
      });
      setTimeout(function () {
        conn.close();
        resolve();
      }, 500);
    } catch (error) {
      console.log("error", error);
      reject(error);
    }
  });
};

module.exports = rabbitSendMessage;
