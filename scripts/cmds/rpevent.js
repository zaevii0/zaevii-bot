module.exports = {
  config: {
    name: "rpevent",
    version: "1.0",
    category: "relationship"
  },

  onStart: async function ({ api, event }) {
    const data = global.relationship?.[event.threadID];

    if (!data)
      return api.sendMessage("💔 No couple active!", event.threadID);

    const roll = Math.random();

    if (roll < 0.4) {
      data.love += 10;
      msg = "💞 Sweet moment! Love increased!";
    } else if (roll < 0.7) {
      data.love -= 5;
      msg = "⚡ Misunderstanding happened!";
    } else {
      data.xp += 15;
      msg = "✨ Deep bonding moment!";
    }

    return api.sendMessage(msg, event.threadID);
  }
};
