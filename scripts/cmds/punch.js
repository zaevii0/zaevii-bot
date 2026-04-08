const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "punch",
    aliases: ["pnch"],
    version: "2.0",
    author: "NC-TOSHIRO + revised",
    countDown: 5,
    role: 0,
    shortDescription: "Punch someone",
    longDescription: "Generate a punch image using avatars",
    category: "fun",
    guide: "{pn} @tag or reply"
  },

  langs: {
    en: {
      noTag: "🥊 Please tag or reply to someone!",
      fail: "❌ Failed to generate punch image."
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      const senderID = event.senderID;

      // Get target (mention or reply)
      let targetID = Object.keys(event.mentions || {})[0];
      if (!targetID && event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
      }

      if (!targetID) return message.reply(getLang("noTag"));

      // Get names
      const senderName = await usersData.getName(senderID).catch(() => "User");
      const targetName = await usersData.getName(targetID).catch(() => "User");

      // Get avatars
      const senderAvatar = await usersData.getAvatarUrl(senderID);
      const targetAvatar = await usersData.getAvatarUrl(targetID);

      if (!senderAvatar || !targetAvatar)
        return message.reply(getLang("fail"));

      // Load images
      const [avatar1, avatar2, bg] = await Promise.all([
        loadImage(senderAvatar),
        loadImage(targetAvatar),
        loadImage("https://raw.githubusercontent.com/X-nil143/XGbal/refs/heads/main/Messenger_creation_25995716493353919.jpeg")
      ]);

      // Canvas
      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Circle avatar function
      function drawAvatar(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      // Positions (you can adjust)
      drawAvatar(avatar1, 1000, 50, 338); // sender
      drawAvatar(avatar2, 80, 572, 338);  // target

      // Save file
      const cacheDir = path.join(__dirname, "tmp");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `${senderID}_${targetID}_punch.png`);
      await fs.writeFile(filePath, canvas.toBuffer());

      // Send
      await message.reply({
        body: `🥊 ${senderName} punched ${targetName}!`,
        attachment: fs.createReadStream(filePath)
      });

      // Delete after send
      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 5000);

    } catch (err) {
      console.error("PUNCH ERROR:", err);
      return message.reply("❌ Something went wrong.");
    }
  }
};
