const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "murgi",
    aliases: ["chicken"],
    version: "1.2",
    author: "NC-FAHAD (rev by ChatGPT)",
    countDown: 5,
    role: 0,
    description: "🐔 Turn someone into a funny murgi",
    category: "fun",
    guide: {
      en: "{pn} @tag | reply"
    }
  },

  langs: {
    en: {
      noTag: "⚠️ | Tag or reply to someone to turn them into a murgi 🐔",
      fail: "❌ | Failed to generate murgi image."
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      // 🎯 Get target
      const targetID =
        Object.keys(event.mentions || {})[0] ||
        event.messageReply?.senderID;

      if (!targetID)
        return message.reply(getLang("noTag"));

      // 👤 Name
      const name = await usersData.getName(targetID).catch(() => "User");

      // 🖼️ Avatar
      const avatarURL = await usersData.getAvatarUrl(targetID);
      const avatarBuffer = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;

      // 📁 Cache folder
      const cacheDir = path.join(__dirname, "tmp");
      await fs.ensureDir(cacheDir);

      // 🖼️ Template
      const templatePath = path.join(cacheDir, "murgi_base.png");
      const templateURL = "https://i.ibb.co/Zp9c0F8n/image0.jpg";

      if (!fs.existsSync(templatePath)) {
        const res = await axios.get(templateURL, { responseType: "arraybuffer" });
        await fs.writeFile(templatePath, res.data);
      }

      const baseImg = await loadImage(templatePath);
      const targetImg = await loadImage(avatarBuffer);

      // 🎨 Canvas
      const canvas = createCanvas(baseImg.width, baseImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      // 📍 Avatar position (adjustable)
      const x = 135;
      const y = 100;
      const size = 90;

      // 🔵 Circle crop
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(targetImg, x, y, size, size);
      ctx.restore();

      // 💾 Save
      const outPath = path.join(cacheDir, `${Date.now()}_murgi.png`);
      await fs.writeFile(outPath, canvas.toBuffer());

      // 💬 Fun captions
      const captions = [
        `🐔 ${name} is now officially a murgi 💀`,
        `🐔 Look at ${name} 😭`,
        `🐔 ${name} got turned into chicken`,
        `🐔 Farm life unlocked for ${name}`
      ];
      const text = captions[Math.floor(Math.random() * captions.length)];

      // 📤 Send
      await message.reply({
        body: text,
        attachment: fs.createReadStream(outPath)
      });

      // 🧹 Cleanup
      setTimeout(() => {
        fs.unlink(outPath).catch(() => {});
      }, 10000);

    } catch (err) {
      console.error("MURGI CMD ERROR:", err);
      return message.reply(getLang("fail"));
    }
  }
};
