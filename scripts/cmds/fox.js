const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "fox",
    version: "1.1",
    author: "𝑵𝑪-𝑺𝑨𝑰𝑴",
    team: "NoobCore",
    role: 0,
    category: "image",
    shortDescription: "🦊 Random fox image",
    guide: "{pn}"
  },

  ncStart: async function ({ api, event }) {
    const cacheDir = path.join(__dirname, "cache");
    const tempPath = path.join(cacheDir, `fox_${Date.now()}.jpg`);

    try {
      await fs.ensureDir(cacheDir);

      const noobcore =
        "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";

      const rawRes = await axios.get(noobcore, { timeout: 10000 });
      const apiBase = rawRes.data?.apiv1;

      if (!apiBase)
        return api.sendMessage("❌ API base not found.", event.threadID, event.messageID);

      const response = await axios.get(`${apiBase}/api/fox`, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      if (!response.data)
        return api.sendMessage("❌ Empty response from API.", event.threadID, event.messageID);

      await fs.writeFile(tempPath, Buffer.from(response.data));

      return api.sendMessage(
        {
          body: "🦊 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐜𝐮𝐭𝐞 𝐟𝐨𝐱 ✨",
          attachment: fs.createReadStream(tempPath)
        },
        event.threadID,
        () => fs.unlinkSync(tempPath),
        event.messageID
      );

    } catch (err) {
      console.error("FOX ERROR:", err);

      return api.sendMessage(
        "❌ Failed to fetch fox image. Try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
