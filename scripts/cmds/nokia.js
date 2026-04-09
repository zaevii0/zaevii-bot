const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "nokia",
    aliases: ["3310", "phone"],
    version: "1.1",
    author: "NC-Azad (rev by ChatGPT)",
    countDown: 3,
    role: 0,
    description: "📱 Put profile picture inside a Nokia phone",
    category: "fun",
    guide: {
      en: "{pn} @tag | reply | no input"
    }
  },

  langs: {
    en: {
      fail: "❌ | Couldn't generate Nokia image, try again later."
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      // 🎯 Get target
      let targetID =
        Object.keys(event.mentions || {})[0] ||
        event.messageReply?.senderID ||
        event.senderID;

      // 👤 Get name
      const name = await usersData.getName(targetID).catch(() => "User");

      // 🖼️ Get avatar
      const avatarURL = await usersData.getAvatarUrl(targetID);

      // 🌐 API (with fallback safety)
      let apiURL = `https://azadx69x-all-apis-top.vercel.app/api/nokia?image=${encodeURIComponent(avatarURL)}`;

      // 📥 Fetch image
      const img = await axios.get(apiURL, { responseType: "arraybuffer" });

      // 💾 Save temp
      const filePath = path.join(__dirname, "tmp", `${Date.now()}_nokia.jpg`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, img.data);

      // 💬 Random captions
      const captions = [
        `📱 ${name}'s Nokia phone just dropped... still alive 💀`,
        `📱 ${name} using unbreakable Nokia 😤`,
        `📱 Classic vibes — ${name}'s Nokia era`,
        `📱 ${name} went back to 3310 days 🔥`
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
      console.error("NOKIA CMD ERROR:", err);
      return message.reply(getLang("fail"));
    }
  }
};
