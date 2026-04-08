module.exports = {
  config: {
    name: "test"
  },
  onStart: async function ({ message }) {
    message.reply("Fun folder works!");
  }
};
