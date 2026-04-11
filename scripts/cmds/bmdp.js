const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "bmdp",
    aliases: ["boysmatchingdp"],
    version: "1.1",
    author: "𝑵𝑪-𝑺𝑨𝑰𝑴",
    team: "NoobCore",
    role: 0,
    category: "image",
    shortDescription: "👬 Random Boys Matching DP",
    guide: "{pn}"
  },

  ncStart: async function ({ api, event }) {
    const cacheDir = path.join(__dirname, "cache");
    const file1 = path.join(cacheDir, `bmdp1_${Date.now()}.jpg`);
    const file2 = path.join(cacheDir, `bmdp2_${Date.now()}.jpg`);

    try {
      await fs.ensureDir(cacheDir);

      const noobcore =
        "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";

      const apiRes = await axios.get(noobcore, { timeout: 10000 });
      const baseUrl = apiRes.data?.saimx69x;

      if (!baseUrl)
        return api.sendMessage("❌ API base not found.", event.threadID, event.messageID);

      const res = await axios.get(`${baseUrl}/api/bmdp`, {
        timeout: 15000
      });

      const boy = res.data?.boy;
      const boy2 = res.data?.boy2;

      if (!boy || !boy2)
        return api.sendMessage("❌ Invalid API response.", event.threadID, event.messageID);

      const img1 = await global.utils.getStreamFromURL(boy).catch(() => null);
      const img2 = await global.utils.getStreamFromURL(boy2).catch(() => null);

      const attachments = [];
      if (img1) attachments.push(img1);
      if (img2) attachments.push(img2);

      if (!attachments.length)
        return api.sendMessage("❌ Failed to load images.", event.threadID, event.messageID);

      return api.sendMessage(
        {
          body: "👬 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐁𝐌𝐃𝐏 ✨",
          attachment: attachments
        },
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.error("BMDP ERROR:", e);

      return api.sendMessage(
        "❌ Something went wrong. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
