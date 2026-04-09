const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "nokia",
    version: "2.0",
    author: "zaevii + GPT",
    role: 0,
    description: "Ultra Pink Nokia Generator"
  },

  onStart: async function ({ message }) {
    try {
      const canvas = createCanvas(800, 800);
      const ctx = canvas.getContext("2d");

      // 🔥 IMAGE (IMPORTANT)
      const img = await loadImage(
        "https://i.pinimg.com/736x/bf/5b/28/bf5b285ee1342960edb0570e381a5511.jpg"
      );

      // draw image full canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // convert to buffer
      const buffer = canvas.toBuffer("image/png");

      return message.reply({
        attachment: buffer
      });

    } catch (err) {
      console.log("NOKIA ERROR:", err);

      return message.reply(
        "❌ Failed to generate ultra pink Nokia.\n👉 Try using a different image host (Pinterest may block bots)."
      );
    }
  }
};
