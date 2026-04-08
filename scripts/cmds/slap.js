const DIG = require("discord-image-generation");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slap",
    aliases: ["botslap"],
    version: "2.0",
    author: "NC-TOSHIRO + upgraded",
    countDown: 5,
    role: 0,
    shortDescription: "Batslap image",
    longDescription: "Generate slap image with user avatars",
    category: "fun",
    guide: {
      en: "{pn} @mention"
    }
  },

  langs: {
    en: {
      noTag: "❌ Please mention a user to slap."
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    try {
      const senderID = event.senderID;
      const mentions = Object.keys(event.mentions || {});
      const targetID = mentions[0];

      if (!targetID)
        return message.reply(getLang("noTag"));

      // Get avatars
      const senderAvatar = await usersData.getAvatarUrl(senderID);
      const targetAvatar = await usersData.getAvatarUrl(targetID);

      if (!senderAvatar || !targetAvatar)
        return message.reply("❌ Failed to get avatar.");

      // Convert to buffer safely
      const senderBuffer = (await axios.get(senderAvatar, { responseType: "arraybuffer" })).data;
      const targetBuffer = (await axios.get(targetAvatar, { responseType: "arraybuffer" })).data;

      // Generate image
      const img = await new DIG.Batslap().getImage(
        Buffer.from(senderBuffer),
        Buffer.from(targetBuffer)
      );

      // Temp folder
      const dir = path.join(__dirname, "tmp");
      const filePath = path.join(dir, `${senderID}_${targetID}_slap.png`);

      await fs.ensureDir(dir);
      await fs.writeFile(filePath, img);

      const msg = args.join(" ").replace(event.mentions[targetID], "").trim();

      return message.reply(
        {
          body: msg || "😵‍💫 SLAP!",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("SLAP ERROR:", err);
      return message.reply("❌ Slap effect failed. Try again later.");
    }
  }
};
