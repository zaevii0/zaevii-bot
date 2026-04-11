const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function getApiBase() {
  try {
    const url =
      "https://raw.githubusercontent.com/noobcore404/NoobCore/main/NCApiUrl.json";
    const res = await axios.get(url, { timeout: 10000 });
    return res.data?.apiv1 || null;
  } catch (e) {
    console.error("GitHub fetch error:", e.message);
    return null;
  }
}

async function toFont(text, id = 21) {
  try {
    const apiBase = await getApiBase();
    if (!apiBase) return text;

    const apiUrl = `${apiBase}/api/font?id=${id}&text=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    return data?.output || text;
  } catch {
    return text;
  }
}

module.exports = {
  config: {
    name: "pair2",
    aliases: ["lovepair2", "match2"],
    version: "2.1",
    author: "NC-SAIM (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "💘 Love pairing system",
    longDescription: "Find a random love match in the group (API version 2)",
    category: "love",
    guide: {
      en: "{pn} (use in group)"
    }
  },

  onStart: async function ({ api, event, usersData, message }) {
    try {
      const thread = await api.getThreadInfo(event.threadID);
      const users = thread.userInfo || [];

      const myID = event.senderID;

      const me = users.find(u => u.id === myID);
      if (!me || !me.gender) {
        return message.reply(
          "⚠️ Could not detect your gender. Try again later."
        );
      }

      const gender = me.gender.toUpperCase();

      let candidates = [];

      if (gender === "MALE") {
        candidates = users.filter(
          u => u.gender === "FEMALE" && u.id !== myID
        );
      } else if (gender === "FEMALE") {
        candidates = users.filter(
          u => u.gender === "MALE" && u.id !== myID
        );
      } else {
        return message.reply("⚠️ Gender not supported.");
      }

      if (!candidates.length) {
        return message.reply("❌ No match found in this group.");
      }

      const match =
        candidates[Math.floor(Math.random() * candidates.length)];

      const senderName = await toFont(
        (await usersData.getName(myID)) || "You"
      );
      const matchName = await toFont(match.name || "Someone");

      const avatar1 = `https://graph.facebook.com/${myID}/picture?width=720&height=720`;
      const avatar2 = `https://graph.facebook.com/${match.id}/picture?width=720&height=720`;

      const apiBase = await getApiBase();
      if (!apiBase) {
        return message.reply("❌ API base not available.");
      }

      const apiUrl = `${apiBase}/api/pair2?avatar1=${encodeURIComponent(
        avatar1
      )}&avatar2=${encodeURIComponent(avatar2)}`;

      const filePath = path.join(__dirname, "tmp", `pair2_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));

      const img = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      await fs.writeFile(filePath, img.data);

      const love = Math.floor(Math.random() * 31) + 70;

      const text = `💞 MATCHMAKING COMPLETE 💞

🎀 ${senderName}
🎀 ${matchName}

🌹 Destiny has connected your paths...
💘 Compatibility: ${love}% 💘`;

      await message.reply(
        {
          body: text,
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("PAIR2 ERROR:", err);
      message.reply("❌ Failed to generate match.");
    }
  }
};
