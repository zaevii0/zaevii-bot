module.exports = {
  config: {
    name: "wheel",
    aliases: ["spin", "roulette", "pick"],
    version: "1.0",
    author: "Zaevii",
    countDown: 5,
    role: 0,
    shortDescription: "Spin the wheel",
    longDescription: "Randomly selects a winner from given choices",
    category: "fun"
  },

  onStart: async function ({ message, args }) {
    if (!args.length) {
      return message.reply(
        "🎡 | Usage:\n*wheel name1, name2, name3"
      );
    }

    // Join all input and split by comma
    const input = args.join(" ");
    const choices = input.split(",").map(item => item.trim()).filter(Boolean);

    if (choices.length < 2) {
      return message.reply("⚠️ | Please provide at least 2 choices separated by commas.");
    }

    // Random selection
    const winner = choices[Math.floor(Math.random() * choices.length)];

    // Fake spinning effect
    let spinning = "🎡 Spinning the wheel...\n";
    message.reply(spinning);

    setTimeout(() => {
      message.reply(`🏆 | The wheel chose: **${winner}**`);
    }, 2000);
  }
};
