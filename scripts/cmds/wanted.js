const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "wanted",
    aliases: ["poster"],
    version: "2.0",
    author: "NC-SAIM (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "Wanted poster 😎",
    longDescription: "Generate a wanted poster using avatar",
    category: "fun",
    guide: {
      en: "{pn} @user | reply | no input = yourself"
    }
  },

  langs: {
    en: {
      fail: "❌ Failed to generate wanted poster."
    }
  },

  // Get API base
  baseApi: async () => {
    try {
      const res = await axios.get(
        "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json"
      );
      return res.data?.apiv1 || null;
    } catch {
      return null;
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      let targetID;

      const mentions = Object.keys(event.mentions || {});
      if (mentions.length > 0) {
        targetID = mentions[0];
      } else if (event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
      } else {
        targetID = event.senderID;
      }

      const [name, avatarURL] = await Promise.all([
        usersData.getName(targetID).catch(() => "Unknown"),
        usersData.getAvatarUrl(targetID)
      ]);

      const baseApi = await this.baseApi();
      if (!baseApi) {
        return message.reply("❌ API base URL not found.");
      }

      const apiURL = `${baseApi}/api/wanted?url=${encodeURIComponent(avatarURL)}`;

      const filePath = path.join(__dirname, "tmp", `wanted_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));

      const res = await axios.get(apiURL, {
        responseType: "arraybuffer"
      });

      await fs.writeFile(filePath, res.data);

      await message.reply(
        {
          body: `🎯 WANTED: ${name}`,
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("WANTED CMD ERROR:", err);
      message.reply(getLang("fail"));
    }
  }
};
