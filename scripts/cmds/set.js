module.exports = {
  config: {
    name: "set",
    aliases: ["st"],
    version: "2.0.0",
    author: "NC-AZAD (upgraded)",
    role: 0,
    category: "economy",
    shortDescription: "Set user money or exp (Owner only)",
    longDescription: "Owner can set money or exp for a user",
    guide: {
      en: `
set money <amount> @user/reply
set exp <amount> @user/reply
      `
    }
  },

  ncStart: async function ({ args, event, api, usersData }) {
    const owners = global.noobCore?.ncsetting?.creator || [];
    const { senderID, threadID, mentions, messageReply } = event;

    // 🔒 Permission check
    if (!owners.includes(senderID)) {
      return api.sendMessage(
        "Access denied. Owner only command.",
        threadID
      );
    }

    const type = (args[0] || "").toLowerCase();
    const amount = Number(args[1]);

    if (!["money", "exp"].includes(type) || !amount || amount < 0) {
      return api.sendMessage(
        "Invalid format.\n\n" +
        "set money <amount> @user/reply\n" +
        "set exp <amount> @user/reply",
        threadID
      );
    }

    // 🎯 Get target user
    let targetID =
      messageReply?.senderID ||
      Object.keys(mentions || {})[0] ||
      senderID;

    const user = await usersData.get(targetID);

    if (!user) {
      return api.sendMessage("User not found in database.", threadID);
    }

    const name = await usersData.getName(targetID);

    // 💰 Update safely (preserve full user data)
    if (type === "money") {
      await usersData.set(targetID, {
        ...user,
        money: amount
      });

      return api.sendMessage(
        `Money updated.\nUser: ${name}\nAmount: ${amount}`,
        threadID
      );
    }

    if (type === "exp") {
      await usersData.set(targetID, {
        ...user,
        exp: amount
      });

      return api.sendMessage(
        `EXP updated.\nUser: ${name}\nAmount: ${amount}`,
        threadID
      );
    }
  }
};
