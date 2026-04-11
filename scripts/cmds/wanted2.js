const DIG = require("discord-image-generation");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "wanted2",
    aliases: ["w2"],
    version: "2.0",
    author: "NC-TOSHIRO (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "Wanted poster 🏜️",
    longDescription: "Generate a wanted poster using avatar (DIG style)",
    category: "fun",
    guide: {
      en: "{pn} @user | reply | no input = yourself"
    }
  },

  langs: {
    en: {
      fail: "❌ Failed to generate wanted poster."
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      let uid;

      const mentions = Object.keys(event.mentions || {});
      if (mentions.length > 0) {
        uid = mentions[0];
      } else if (event.messageReply?.senderID) {
        uid = event.messageReply.senderID;
      } else {
        uid = event.senderID;
      }

      const [name, avatarURL] = await Promise.all([
        usersData.getName(uid).catch(() => "Someone"),
        usersData.getAvatarUrl(uid)
      ]);

      const res = await axios.get(avatarURL, {
        responseType: "arraybuffer"
      });

      const buffer = Buffer.from(res.data);

      const image = await new DIG.Wanted().getImage(buffer);

      const filePath = path.join(__dirname, "tmp", `wanted_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, image);

      await message.reply(
        {
          body: `🎯 WANTED: ${name}`,
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("WANTED2 CMD ERROR:", err);
      message.reply(getLang("fail"));
    }
  }
};
