const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "kiss2",
    aliases: ["k2"],
    version: "3.6",
    author: "NC-XALMAN (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "💋 Kiss canvas generator",
    longDescription: "Generate a kiss image using avatars (mention/reply/UID)",
    category: "love",
    guide: {
      en: "{pn} @user | reply | uid"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      const { threadID, messageID, senderID } = event;

      // Get target ID safely
      let targetID =
        Object.keys(event.mentions || {})[0] ||
        event.messageReply?.senderID ||
        args[0];

      if (!targetID) {
        return api.sendMessage(
          "💋 Please mention, reply, or provide a UID!",
          threadID,
          messageID
        );
      }

      // User info
      const [senderInfo, targetInfo] = await Promise.all([
        usersData.get(senderID).catch(() => ({ name: "User" })),
        usersData.get(targetID).catch(() => ({ name: "Crush" }))
      ]);

      const senderName = senderInfo.name || "User";
      const targetName = targetInfo.name || "Crush";

      // Avatar URLs
      const avatarSender = `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;
      const avatarTarget = `https://graph.facebook.com/${targetID}/picture?width=512&height=512`;

      // Load images
      const [bg, img1, img2] = await Promise.all([
        loadImage("https://i.ibb.co/jjhvv0j/74e00c6d62a7.jpg"),
        loadImage(avatarSender),
        loadImage(avatarTarget)
      ]);

      // Canvas setup
      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Circle helper
      const drawCircle = (img, x, y, r) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
        ctx.restore();
      };

      // Fixed positions (no gender dependency for stability)
      drawCircle(img1, 240, 200, 60);
      drawCircle(img2, 360, 260, 60);

      // Save file
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `kiss2_${Date.now()}.png`);
      await fs.writeFile(filePath, canvas.toBuffer());

      // Send result
      await api.sendMessage(
        {
          body: `💋 ${senderName} kissed ${targetName}!`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );

    } catch (err) {
      console.error("KISS2 ERROR:", err);
      return api.sendMessage(
        "❌ An error occurred while generating kiss image.",
        event.threadID,
        event.messageID
      );
    }
  }
};
