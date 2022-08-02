const executeSequence = async (context, sequence) => {
  console.log("sequence", sequence);

  try {
    for (let fn of sequence) {
      context = await fn.apply(null, [context]);
    }

    return context;
  } catch (error) {
    throw error;
  }
};

module.exports = executeSequence;
