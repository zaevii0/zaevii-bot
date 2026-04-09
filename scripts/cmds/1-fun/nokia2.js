const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "nokia2",
    aliases: ["pinknokia", "nokiapink"],
    version: "1.0",
    author: "rev by ChatGPT",
    countDown: 3,
    role: 0,
    description: "💗 Put profile inside a pink Nokia phone",
    category: "fun",
    guide: {
      en: "{pn} @tag | reply | no input"
    }
  },

  langs: {
    en: {
      fail: "❌ | Failed to generate pink Nokia image."
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      // 🎯 Target
      const uid =
        Object.keys(event.mentions || {})[0] ||
        event.messageReply?.senderID ||
        event.senderID;

      const name = await usersData.getName(uid).catch(() => "User");

      // 🖼️ Avatar
      const avatarURL = await usersData.getAvatarUrl(uid);
      const avatarBuffer = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;

      // 📁 Temp folder
      const cacheDir = path.join(__dirname, "tmp");
      await fs.ensureDir(cacheDir);

      // 📱 Pink Nokia template
      const templatePath = path.join(cacheDir, "pink_nokia.png");
      const templateURL = "https://i.ibb.co/4W2DGKm/pink-nokia.png"; // ⚠️ replace if you have better HD pink nokia

      if (!fs.existsSync(templatePath)) {
        const res = await axios.get(templateURL, { responseType: "arraybuffer" });
        await fs.writeFile(templatePath, res.data);
      }

      const base = await loadImage(templatePath);
      const avatar = await loadImage(avatarBuffer);

      // 🎨 Canvas
      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      // 📍 Screen position (adjust if needed)
      const x = 95;
      const y = 120;
      const w = 120;
      const h = 140;

      ctx.drawImage(avatar, x, y, w, h);

      // 💾 Save
      const filePath = path.join(cacheDir, `${Date.now()}_pink_nokia.png`);
      await fs.writeFile(filePath, canvas.toBuffer());

      // 💬 Captions
      const captions = [
        `💗 ${name}'s pink Nokia era`,
        `📱✨ Cute but unbreakable — ${name}`,
        `💗 ${name} using aesthetic Nokia`,
        `📱💗 Barbie Nokia unlocked for ${name}`
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
      console.error("PINK NOKIA ERROR:", err);
      return message.reply(getLang("fail"));
    }
  }
};
