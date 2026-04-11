const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "hug",
    aliases: ["hugs"],
    version: "2.0",
    author: "NC-SAIM (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "🤗 Hug generator",
    longDescription: "Create a cute hug image between two users",
    category: "fun",
    guide: {
      en: "{pn} @user OR reply"
    }
  },

  langs: {
    en: {
      noTag: "🤗 Please tag someone or reply to a message.",
      fail: "❌ Failed to generate hug image."
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      const uid1 = event.senderID;

      let uid2 = Object.keys(event.mentions || {})[0];
      if (!uid2 && event.messageReply?.senderID) {
        uid2 = event.messageReply.senderID;
      }

      if (!uid2) {
        return message.reply(getLang("noTag"));
      }

      const [name1, name2] = await Promise.all([
        usersData.getName(uid1).catch(() => "User"),
        usersData.getName(uid2).catch(() => "Friend")
      ]);

      const [avatar1, avatar2] = await Promise.all([
        usersData.getAvatarUrl(uid1),
        usersData.getAvatarUrl(uid2)
      ]);

      const apiJson =
        "https://raw.githubusercontent.com/noobcore404/NoobCore/main/NCApiUrl.json";

      const raw = await axios.get(apiJson, { timeout: 10000 });
      const apiBase = raw.data?.apiv1;

      if (!apiBase) {
        return message.reply("❌ API base not found.");
      }

      const apiURL = `${apiBase}/api/hug?boy=${encodeURIComponent(
        avatar1
      )}&girl=${encodeURIComponent(avatar2)}`;

      const imgRes = await axios.get(apiURL, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      const filePath = path.join(__dirname, "tmp", `hug_${Date.now()}.jpg`);
      await fs.ensureDir(path.dirname(filePath));

      await fs.writeFile(filePath, imgRes.data);

      await message.reply(
        {
          body: `🤗 ${name1} just hugged ${name2}! ❤️`,
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("HUG CMD ERROR:", err);
      message.reply(getLang("fail"));
    }
  }
};
