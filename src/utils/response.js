const toToolResponse = (payload) => ({
  content: [
    {
      type: "text",
      text: JSON.stringify(payload, null, 2),
    },
  ],
});

module.exports = { toToolResponse };
