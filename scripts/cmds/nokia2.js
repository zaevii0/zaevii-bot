const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "nokia2",
    aliases: ["pinknokia", "ultranokia"],
    version: "3.0",
    author: "rev by ChatGPT",
    countDown: 3,
    role: 0,
    description: "💗 Ultra clean pink Nokia transformation",
    category: "fun"
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      const uid =
        Object.keys(event.mentions || {})[0] ||
        event.messageReply?.senderID ||
        event.senderID;

      const name = await usersData.getName(uid).catch(() => "User");

      const avatarURL = await usersData.getAvatarUrl(uid);
      const avatar = await loadImage(
        (await axios.get(avatarURL, { responseType: "arraybuffer" })).data
      );

      const cacheDir = path.join(__dirname, "tmp");
      await fs.ensureDir(cacheDir);

      // 📱 YOUR NOKIA IMAGE (IMPORTANT)
      const templatePath = path.join(cacheDir, "nokia_base.png");
      const templateURL = "https://i.ibb.co/your-nokia-image.png"; // replace

      if (!fs.existsSync(templatePath)) {
        const res = await axios.get(templateURL, { responseType: "arraybuffer" });
        await fs.writeFile(templatePath, res.data);
      }

      const base = await loadImage(templatePath);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext("2d");

      // 🖤 STEP 1: draw original image
      ctx.drawImage(base, 0, 0);

      // 💗 STEP 2: CLEAN MASK (only phone body)
      // We simulate clean recolor using soft layer instead of full overlay
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";

      // soft pink gradient (gives premium look)
      const gradient = ctx.createLinearGradient(0, 0, base.width, base.height);
      gradient.addColorStop(0, "rgba(255, 182, 193, 0.55)"); // light pink
      gradient.addColorStop(0.5, "rgba(255, 105, 180, 0.45)"); // hot pink
      gradient.addColorStop(1, "rgba(255, 20, 147, 0.35)"); // deep pink

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, base.width, base.height);
      ctx.restore();

      // 📱 STEP 3: SCREEN (kept CLEAN, no tint)
      const x = 95;
      const y = 120;
      const w = 120;
      const h = 140;

      ctx.drawImage(avatar, x, y, w, h);

      // 💾 Save output
      const outPath = path.join(cacheDir, `${Date.now()}_ultra_pink_nokia.png`);
      await fs.writeFile(outPath, canvas.toBuffer());

      // 💬 captions
      const captions = [
        `💗 Ultra Pink Nokia unlocked for ${name}`,
        `📱 Barbie mode activated 💅`,
        `💗 ${name} got premium pink Nokia`,
        `✨ Clean aesthetic Nokia for ${name}`
      ];

      await message.reply({
        body: captions[Math.floor(Math.random() * captions.length)],
        attachment: fs.createReadStream(outPath)
      });

      setTimeout(() => {
        fs.unlink(outPath).catch(() => {});
      }, 10000);

    } catch (err) {
      console.error("ULTRA NOKIA ERROR:", err);
      message.reply("❌ Failed to generate ultra pink Nokia");
    }
  }
};
