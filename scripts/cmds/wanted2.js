const DIG = require("discord-image-generation");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "wanted2",
    aliases: ["wanted", "poster"],
    version: "1.2",
    author: "NC-TOSHIRO (rev by ChatGPT)",
    countDown: 5,
    role: 0,
    description: "🪧 Create a wanted poster",
    category: "fun",
    guide: {
      en: "{pn} @tag | reply | no input"
    }
  },

  langs: {
    en: {
      fail: "❌ | Failed to create wanted poster."
    }
  },

  onStart: async ({ event, message, usersData, getLang }) => {
    try {
      // 🎯 Target detection
      const uid =
        Object.keys(event.mentions || {})[0] ||
        event.messageReply?.senderID ||
        event.senderID;

      // 👤 Name
      const name = await usersData.getName(uid).catch(() => "User");

      // 🖼️ Avatar → buffer
      const avatarURL = await usersData.getAvatarUrl(uid);
      const avatar = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;

      // 🎨 Generate image
      const img = await new DIG.Wanted().getImage(avatar);

      // 💾 Save temp
      const filePath = path.join(__dirname, "tmp", `${Date.now()}_wanted.png`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, img);

      // 💬 Fun captions
      const captions = [
        `🪧 WANTED: ${name} (Dead or Alive 💀)`,
        `🚨 ${name} is officially wanted!`,
        `🪧 Bounty placed on ${name} 😤`,
        `⚠️ Dangerous individual: ${name}`
      ];
      const text = captions[Math.floor(Math.random() * captions.length)];

      // 📤 Send
      await message.reply({
        body: text,
        attachment: fs.createReadStream(filePath)
      });

      // 🧹 Cleanup
      setTimeout(() => {
        fs.unlink(filePath).catch(() => {});
      }, 10000);

    } catch (err) {
      console.error("WANTED CMD ERROR:", err);
      return message.reply(getLang("fail"));
    }
  }
};
