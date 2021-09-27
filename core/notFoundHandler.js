module.exports = (request, reply) => {
  reply.status(404).send({
    error: "Not Found",
  });
};
