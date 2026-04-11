const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    aliases: ["hck"],
    version: "2.0",
    author: "Azadx69x (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "Fake hack image 💻",
    longDescription: "Generate a fake hacking result image using API",
    category: "fun",
    guide: {
      en: "{pn} @user"
    }
  },

  langs: {
    en: {
      fail: "❌ Failed to generate hack image."
    }
  },

  // Get API base URL
  baseApi: async () => {
    try {
      const res = await axios.get(
        "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
      );
      return res.data.mahmud;
    } catch {
      return null;
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      const senderID = event.senderID;
      const mention = Object.keys(event.mentions || {})[0];
      const targetID = mention || senderID;

      const baseApi = await this.baseApi();
      if (!baseApi) {
        return message.reply("❌ API base URL not available.");
      }

      // Get name safely
      const name = await usersData.getName(targetID).catch(() => "Unknown");

      // Temp file
      const filePath = path.join(__dirname, "tmp", `hack_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));

      // Fetch image
      const res = await axios.get(
        `${baseApi}/api/hack?id=${encodeURIComponent(targetID)}&name=${encodeURIComponent(name)}`,
        { responseType: "arraybuffer" }
      );

      await fs.writeFile(filePath, res.data);

      const replyText = `
┏━━🛡️ 𝐇𝐀𝐂𝐊 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 ━━┓
🎯 Target: ${name}
🖥️ Status: Access Granted
📂 Data Extracted Successfully
📨 Sending Results...
┗━━━━━━━━━━━━━━━━━━┛`;

      await message.reply(
        {
          body: replyText,
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("HACK CMD ERROR:", err);
      message.reply(getLang("fail"));
    }
  }
};
