const DIG = require("discord-image-generation");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slap",
    aliases: ["botslap"],
    version: "2.0",
    author: "NC-TOSHIRO (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "Slap someone 💥",
    longDescription: "Generate a batslap image using avatars",
    category: "fun",
    guide: {
      en: "{pn} @user"
    }
  },

  langs: {
    en: {
      noTag: "❌ Please mention someone to slap."
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    try {
      const senderID = event.senderID;
      const mentions = Object.keys(event.mentions || {});
      const targetID = mentions[0];

      if (!targetID) {
        return message.reply(getLang("noTag"));
      }

      // Get avatar URLs
      const senderAvatar = await usersData.getAvatarUrl(senderID);
      const targetAvatar = await usersData.getAvatarUrl(targetID);

      // Convert to buffer
      const senderBuffer = Buffer.from(
        (await axios.get(senderAvatar, { responseType: "arraybuffer" })).data
      );

      const targetBuffer = Buffer.from(
        (await axios.get(targetAvatar, { responseType: "arraybuffer" })).data
      );

      // Generate image
      const image = await new DIG.Batslap().getImage(
        senderBuffer,
        targetBuffer
      );

      // Temp file path
      const filePath = path.join(__dirname, "tmp", `slap_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, image);

      // Optional message
      const text = args.join(" ").replace(event.mentions[targetID], "").trim();

      message.reply(
        {
          body: text || "💥 Slapped!",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (error) {
      console.error("SLAP ERROR:", error);
      message.reply("❌ Failed to generate slap image.");
    }
  }
};
