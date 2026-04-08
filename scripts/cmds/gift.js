module.exports = {
  config: {
    name: "gift",
    version: "1.0",
    category: "relationship"
  },

  onStart: async function ({ api, event }) {
    const data = global.relationship?.[event.threadID];

    if (!data)
      return api.sendMessage("💔 No couple found!", event.threadID);

    data.love += 5;
    data.xp += 20;

    if (data.xp >= 100) {
      data.level += 1;
      data.xp = 0;
    }

    return api.sendMessage(
      `🎁 Gift sent!\n💖 Love +5\n📈 Level: ${data.level}`,
      event.threadID
    );
  }
};
