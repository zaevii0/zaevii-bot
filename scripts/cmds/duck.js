const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "duck",
    version: "1.1",
    author: "𝑵𝑪-𝑺𝑨𝑰𝑴",
    team: "NoobCore",
    role: 0,
    category: "image",
    shortDescription: "🦆 Random duck image",
    guide: "{pn}"
  },

  ncStart: async function ({ api, event }) {
    const cacheDir = path.join(__dirname, "cache");
    const tempPath = path.join(cacheDir, `duck_${Date.now()}.jpg`);

    try {
      await fs.ensureDir(cacheDir);

      const noobcore =
        "https://raw.githubusercontent.com/noobcore404/NoobCore/main/NCApiUrl.json";

      const rawRes = await axios.get(noobcore, { timeout: 10000 });
      const apiBase = rawRes.data?.apiv1;

      if (!apiBase)
        return api.sendMessage("❌ API base not found.", event.threadID, event.messageID);

      const response = await axios.get(`${apiBase}/api/duck`, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      if (!response.data)
        return api.sendMessage("❌ Empty response from API.", event.threadID, event.messageID);

      await fs.writeFile(tempPath, Buffer.from(response.data));

      return api.sendMessage(
        {
          body: "🦆 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐜𝐮𝐭𝐞 𝐝𝐮𝐜𝐤 ✨",
          attachment: fs.createReadStream(tempPath)
        },
        event.threadID,
        () => fs.unlinkSync(tempPath),
        event.messageID
      );

    } catch (err) {
      console.error("DUCK ERROR:", err);

      return api.sendMessage(
        "❌ Failed to fetch duck image. Try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
