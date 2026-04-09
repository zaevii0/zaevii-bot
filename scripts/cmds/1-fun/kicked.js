const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "kicked",
    aliases: ["kickimg"],
    version: "2.0",
    author: "NC-SAIM (upgraded)",
    countDown: 5,
    role: 0,
    description: "👢 Kick someone with style",
    category: "fun",
    guide: {
      en: "{pn} @tag [optional message] or reply"
    }
  },

  langs: {
    en: {
      noTag: "⚠️ | Tag or reply to someone to kick them.",
      fail: "❌ | Image failed, but the kick still landed 💀"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    try {
      const senderID = event.senderID;

      let targetID = Object.keys(event.mentions || {})[0];
      if (!targetID && event.messageReply)
        targetID = event.messageReply.senderID;

      if (!targetID)
        return message.reply(getLang("noTag"));

      // Names
      const senderName = await usersData.getName(senderID).catch(() => "Someone");
      const targetName = await usersData.getName(targetID).catch(() => "someone");

      // Custom message or random lines
      const customText = args.join(" ");
      const randomLines = [
        "got sent flying 💨",
        "wasn't ready 😭",
        "just got destroyed 💀",
        "is now in another dimension 🚀",
        "shouldn't have tested me 😤"
      ];
      const actionText = customText || randomLines[Math.floor(Math.random() * randomLines.length)];

      // Avatars
      const senderAvatar = await usersData.getAvatarUrl(senderID);
      const targetAvatar = await usersData.getAvatarUrl(targetID);

      // API fallback system
      let apiBase = "https://nexalo-api.vercel.app";
      try {
        const res = await axios.get("https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json");
        if (res.data?.apiv1) apiBase = res.data.apiv1;
      } catch {}

      const apiURL = `${apiBase}/api/kicked?kicker=${encodeURIComponent(senderAvatar)}&kicked=${encodeURIComponent(targetAvatar)}`;

      let imgPath = path.join(__dirname, "tmp", `${Date.now()}_kicked.jpg`);
      await fs.ensureDir(path.dirname(imgPath));

      let imageSuccess = true;

      try {
        const img = await axios.get(apiURL, { responseType: "arraybuffer" });
        await fs.writeFile(imgPath, img.data);
      } catch {
        imageSuccess = false;
      }

      // Send response
      if (imageSuccess) {
        await message.reply({
          body: `👢 ${senderName} kicked ${targetName} — ${actionText}`,
          attachment: fs.createReadStream(imgPath)
        });
      } else {
        await message.reply(`👢 ${senderName} kicked ${targetName} — ${actionText}`);
      }

      // Cleanup
      setTimeout(() => {
        fs.unlink(imgPath).catch(() => {});
      }, 10000);

    } catch (err) {
      console.error("Kicked error:", err);
      return message.reply(getLang("fail"));
    }
  }
};
