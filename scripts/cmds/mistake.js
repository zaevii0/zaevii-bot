const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_JSON =
  "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";

// Get API base
async function getApiV1() {
  try {
    const res = await axios.get(API_JSON, { timeout: 10000 });
    return res.data?.apiv1 || null;
  } catch {
    return null;
  }
}

module.exports = {
  config: {
    name: "mistake",
    aliases: ["msk"],
    version: "2.0",
    author: "NC-SAIM (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "Funny mistake meme 😂",
    longDescription: "Tag or reply to someone to create a mistake meme",
    category: "fun",
    guide: {
      en: "{pn} @user OR reply"
    }
  },

  langs: {
    en: {
      noTag: "⚠️ Please tag or reply to someone.",
      fail: "❌ Failed to generate mistake meme."
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
      }

      if (!targetID) {
        return message.reply(getLang("noTag"));
      }

      const baseApi = await getApiV1();
      if (!baseApi) {
        return message.reply("❌ API unavailable.");
      }

      const name = await usersData.getName(targetID).catch(() => "Someone");

      const filePath = path.join(__dirname, "tmp", `mistake_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));

      const res = await axios.get(
        `${baseApi}/api/mistake?uid=${encodeURIComponent(targetID)}`,
        {
          responseType: "arraybuffer",
          timeout: 30000
        }
      );

      await fs.writeFile(filePath, res.data);

      await message.reply(
        {
          body: `😂 ${name} was a mistake`,
          mentions: [{ id: targetID, tag: name }],
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("MISTAKE CMD ERROR:", err);
      message.reply(getLang("fail"));
    }
  }
};
