const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "nokia",
    version: "2.1",
    author: "zaevii + GPT",
    role: 0,
    description: "Ultra Pink Nokia Generator (Stable)"
  },

  onStart: async function ({ message }) {
    try {
      // 📌 Canvas setup
      const canvas = createCanvas(800, 800);
      const ctx = canvas.getContext("2d");

      // 📌 Load image (YOUR WORKING IMGUR LINK)
      const img = await loadImage("https://i.imgur.com/Xum4W7G.png");

      // 📌 Fit image properly (no distortion)
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      );

      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;

      ctx.drawImage(
        img,
        x,
        y,
        img.width * scale,
        img.height * scale
      );

      // 📌 Export image
      const buffer = canvas.toBuffer("image/png");

      return message.reply({
        attachment: buffer
      });

    } catch (err) {
      console.log("❌ NOKIA COMMAND ERROR:", err);

      return message.reply(
        "❌ Failed to generate Nokia image.\n👉 Check logs or image source."
      );
    }
  }
};
