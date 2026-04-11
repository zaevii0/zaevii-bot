const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

module.exports = {
  config: {
    name: "pixel",
    aliases: ["pexel", "img"],
    version: "1.3",
    author: "NC-XNIL",
    role: 0,
    category: "image",
    shortDescription: "Search pixel images",
    guide: "{pn} <keyword> -<count>"
  },

  ncStart: async function ({ api, args, message, getLang }) {
    if (!args.length)
      return message.reply("❌ Please enter a search keyword.");

    let count = 10;
    const keywords = [];

    for (const arg of args) {
      if (arg.startsWith("-") && !isNaN(arg.slice(1))) {
        count = Math.min(30, Math.max(1, Number(arg.slice(1))));
      } else {
        keywords.push(arg);
      }
    }

    const query = keywords.join(" ").trim();
    if (!query)
      return message.reply("❌ Invalid search query.");

    await message.reply(`🔎 Searching images for: ${query} ...`);

    const tempFiles = [];

    try {
      const rawURL =
        "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";

      const apiList = await axios.get(rawURL, { timeout: 10000 });
      const pixelAPI = apiList.data?.Pixel;

      if (!pixelAPI)
        return message.reply("❌ Pixel API not found.");

      const apiUrl = `${pixelAPI}?search=${encodeURIComponent(query)}&count=${count}`;

      const res = await axios.get(apiUrl, { timeout: 20000 });

      const images = res.data?.data || res.data?.images;

      if (!Array.isArray(images) || !images.length)
        return message.reply(`⚠️ No images found for "${query}"`);

      const selected = images.slice(0, count);
      const attachments = [];

      for (let i = 0; i < selected.length; i++) {
        try {
          const imgUrl = selected[i];

          const filePath = path.join(
            __dirname,
            "cache",
            `pixel_${Date.now()}_${i}.jpg`
          );

          const img = await axios.get(imgUrl, {
            responseType: "arraybuffer",
            timeout: 15000
          });

          await fs.ensureDir(path.dirname(filePath));
          await fs.writeFile(filePath, img.data);

          attachments.push(fs.createReadStream(filePath));
          tempFiles.push(filePath);

          await sleep(150);
        } catch (e) {
          console.log("Image skip:", e.message);
        }
      }

      if (!attachments.length)
        return message.reply("❌ Failed to load images.");

      await message.reply({
        body: `🖼️ 𝐏𝐢𝐱𝐞𝐥 𝐒𝐞𝐚𝐫𝐜𝐡\n🔍 ${query}\n📦 Results: ${attachments.length}`,
        attachment: attachments
      });

    } catch (err) {
      console.error("PIXEL ERROR:", err);
      return message.reply("❌ Failed to fetch images. Try again later.");
    } finally {
      // cleanup
      for (const file of tempFiles) {
        try {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        } catch {}
      }
    }
  }
};
