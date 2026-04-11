const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function getApiBase() {
  try {
    const apiUrl =
      "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const res = await axios.get(apiUrl, { timeout: 10000 });
    return res.data?.saimx69x || null;
  } catch (e) {
    console.error("API URL fetch error:", e.message);
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
    name: "pair",
    aliases: ["lovepair", "match"],
    version: "2.0",
    author: "NC-Saimx69x (rev by GPT)",
    countDown: 5,
    role: 0,
    shortDescription: "💘 Love pairing system",
    longDescription: "Find a random love match in the group",
    category: "fun",
    guide: {
      en: "{pn} (use in group)"
    }
  },

  onStart: async function ({ api, event, usersData, message }) {
    try {
      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo || [];

      const myID = event.senderID;

      const myData = users.find(u => u.id === myID);
      if (!myData || !myData.gender) {
        return message.reply(
          "⚠️ Cannot detect your gender. Try again later."
        );
      }

      const myGender = myData.gender.toUpperCase();

      let candidates = [];

      if (myGender === "MALE") {
        candidates = users.filter(
          u => u.gender === "FEMALE" && u.id !== myID
        );
      } else if (myGender === "FEMALE") {
        candidates = users.filter(
          u => u.gender === "MALE" && u.id !== myID
        );
      } else {
        return message.reply(
          "⚠️ Gender not supported for matching."
        );
      }

      if (!candidates.length) {
        return message.reply("❌ No match found in this group.");
      }

      const match = candidates[Math.floor(Math.random() * candidates.length)];

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

      const apiUrl = `${apiBase}/api/pair?avatar1=${encodeURIComponent(
        avatar1
      )}&avatar2=${encodeURIComponent(avatar2)}`;

      const filePath = path.join(__dirname, "tmp", `pair_${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));

      const img = await axios.get(apiUrl, { responseType: "arraybuffer" });
      await fs.writeFile(filePath, img.data);

      const love = Math.floor(Math.random() * 31) + 70;

      const text = `💞 MATCH FOUND 💞

🎀 ${senderName}
💘 ${matchName}

💫 Compatibility: ${love}%
🌹 Destiny has spoken...`;

      await message.reply(
        {
          body: text,
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );
    } catch (err) {
      console.error("PAIR ERROR:", err);
      message.reply("❌ Failed to generate pair result.");
    }
  }
};
