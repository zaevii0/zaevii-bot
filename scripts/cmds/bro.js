const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "bro",
    aliases: ["bestie", "nakama"],
    version: "2.0",
    author: "NC-TOSHIRO (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "Bond image 🤝",
    longDescription: "Generate a duo bond image using avatars",
    category: "fun",
    guide: {
      en: "{pn} @user OR reply"
    }
  },

  langs: {
    en: {
      noTag: "🤝 Please tag someone or reply to a message.",
      fail: "❌ Failed to generate image.",
      replyMsg: "😏 Bro bond getting stronger!"
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

      const [senderName, targetName] = await Promise.all([
        usersData.getName(senderID).catch(() => "Bro"),
        usersData.getName(targetID).catch(() => "Nakama")
      ]);

      const [senderAvatarURL, targetAvatarURL] = await Promise.all([
        usersData.getAvatarUrl(senderID),
        usersData.getAvatarUrl(targetID)
      ]);

      const bgURL =
        "https://raw.githubusercontent.com/Toshiro6t9/Bzsb/refs/heads/main/6f676d2d9ecbb564f42e08a0196832e5.jpg";

      const [senderAvatar, targetAvatar, baseImage] = await Promise.all([
        loadImage(senderAvatarURL),
        loadImage(targetAvatarURL),
        loadImage(bgURL)
      ]);

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

      // Avatar positions
      drawCircle(senderAvatar, 190, 60, 120);
      drawCircle(targetAvatar, 400, 98, 120);

      const filePath = path.join(__dirname, "tmp", `bro_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, canvas.toBuffer());

      const sentMsg = await message.reply({
        body: `🤝 ${senderName} & ${targetName} = Ultimate Duo!`,
        attachment: fs.createReadStream(filePath)
      });

      // Save reply context
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: "bro",
        author: senderID
      });

      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 8000);

    } catch (err) {
      console.error("BRO CMD ERROR:", err);
      message.reply(getLang("fail"));
    }
  },

  onReply: async function ({ event, message, Reply, getLang }) {
    if (event.senderID !== Reply.author) return;

    message.reply(getLang("replyMsg"));
  }
};
