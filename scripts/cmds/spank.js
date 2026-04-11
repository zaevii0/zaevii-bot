const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "spank",
    aliases: ["spnk"],
    version: "2.0",
    author: "NC-TOSHIRO (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "🍑 Spank someone",
    longDescription: "Generate a spank image using avatars",
    category: "fun",
    guide: {
      en: "{pn} @user OR reply"
    }
  },

  langs: {
    en: {
      noTag: "🍑 Please tag a user or reply to a message.",
      fail: "❌ Failed to generate the spank image."
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      const senderID = event.senderID;

      let targetID = Object.keys(event.mentions || {})[0];
      if (!targetID && event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
      }

      if (!targetID) {
        return message.reply(getLang("noTag"));
      }

      // Names
      const [senderName, targetName] = await Promise.all([
        usersData.getName(senderID).catch(() => "Someone"),
        usersData.getName(targetID).catch(() => "someone")
      ]);

      // Avatars
      const [senderAvatarURL, targetAvatarURL] = await Promise.all([
        usersData.getAvatarUrl(senderID),
        usersData.getAvatarUrl(targetID)
      ]);

      const [senderAvatar, targetAvatar, baseImage] = await Promise.all([
        loadImage(senderAvatarURL),
        loadImage(targetAvatarURL),
        loadImage("https://raw.githubusercontent.com/bolanakiabal/Abalsjsjdk/refs/heads/main/src/Img/New%20Project%2060%20%5B3FCBC80%5D.png")
      ]);

      // Canvas
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      const drawCircle = (img, x, y, size) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      };

      // Positions (adjust if needed)
      drawCircle(senderAvatar, 620, 440, 384);
      drawCircle(targetAvatar, 1506, 10, 384);

      // Save temp file
      const filePath = path.join(__dirname, "tmp", `spank_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, canvas.toBuffer());

      // Random funny lines
      const messages = [
        `🍑 ${senderName} just spanked ${targetName}!`,
        `💥 That was loud... ${targetName} felt it!`,
        `😂 ${senderName} chose violence today.`,
        `😈 ${targetName} won’t sit comfortably for a while.`,
        `🔥 That hit different... literally.`,
        `💀 Emotional + physical damage combo!`
      ];

      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      await message.reply({
        body: randomMsg,
        attachment: fs.createReadStream(filePath)
      });

      // Cleanup
      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 5000);

    } catch (err) {
      console.error("SPANK ERROR:", err);
      message.reply(getLang("fail"));
    }
  }
};
