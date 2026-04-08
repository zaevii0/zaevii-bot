module.exports = {
  config: {
    name: "couple",
    version: "1.0",
    category: "relationship"
  },

  onStart: async function ({ api, event, usersData }) {
    const data = global.relationship?.[event.threadID];

    if (!data)
      return api.sendMessage("💔 No active couple!", event.threadID);

    const n1 = await usersData.getName(data.user1);
    const n2 = await usersData.getName(data.user2);

    return api.sendMessage(
      `💑 COUPLE INFO\n\n👤 ${n1}\n❤️ ${n2}\n💖 Love: ${data.love}%\n📈 Level: ${data.level}\n💍 Married: ${data.married ? "Yes" : "No"}`,
      event.threadID
    );
  }
};
