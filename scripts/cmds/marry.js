module.exports = {
  config: {
    name: "marry",
    version: "1.0",
    category: "relationship"
  },

  onStart: async function ({ api, event, usersData }) {
    const data = global.relationship?.[event.threadID];

    if (!data)
      return api.sendMessage("💔 No pair found!", event.threadID);

    data.married = true;
    data.love = Math.min(100, data.love + 20);

    const n1 = await usersData.getName(data.user1);
    const n2 = await usersData.getName(data.user2);

    return api.sendMessage(
      `💍 MARRIAGE SUCCESSFUL\n\n👤 ${n1} ❤️ ${n2}\n💖 Eternal Bond Activated`,
      event.threadID
    );
  }
};
