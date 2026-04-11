const axios = require("axios");

module.exports = {
  config: {
    name: "cdp",
    aliases: ["coupledp"],
    version: "1.1",
    author: "𝑵𝑪-𝑺𝑨𝑰𝑴",
    team: "NoobCore",
    countDown: 5,
    role: 0,
    shortDescription: "Random Couple DP",
    category: "image",
    guide: "{pn}"
  },

  ncStart: async function ({ api, event }) {
    try {
      const noobcore = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const apiRes = await axios.get(noobcore);
      const baseUrl = apiRes.data?.saimx69x;

      if (!baseUrl)
        return api.sendMessage("❌ API base not found.", event.threadID, event.messageID);

      const res = await axios.get(`${baseUrl}/api/cdp2`);
      const { boy, girl } = res.data || {};

      if (!boy || !girl)
        return api.sendMessage("❌ Invalid API response.", event.threadID, event.messageID);

      const boyStream = await global.utils.getStreamFromURL(boy).catch(() => null);
      const girlStream = await global.utils.getStreamFromURL(girl).catch(() => null);

      const attachments = [];
      if (boyStream) attachments.push(boyStream);
      if (girlStream) attachments.push(girlStream);

      if (attachments.length === 0)
        return api.sendMessage("❌ Failed to load images.", event.threadID, event.messageID);

      return api.sendMessage(
        {
          body: "💞 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏 ✨",
          attachment: attachments
        },
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.error(e);
      api.sendMessage(
        "❌ Something went wrong. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
