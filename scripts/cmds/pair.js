const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    aliases: ["ship", "match"],
    version: "1.0",
    author: "zaevii",
    countDown: 5,
    role: 0,
    shortDescription: "Pair two random users",
    longDescription: "Random love pairing with aesthetic image",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, senderID, participantIDs } = event;

    if (participantIDs.length < 2)
      return api.sendMessage("❌ Not enough users to pair!", threadID);

    // pick random partner (not sender)
    let randomUser;
    do {
      randomUser = participantIDs[Math.floor(Math.random() * participantIDs.length)];
    } while (randomUser === senderID);

    const name1 = await usersData.getName(senderID);
    const name2 = await usersData.getName(randomUser);

    const love = Math.floor(Math.random() * 101);

    // aesthetic image (you can replace this API)
    const imgUrl = `https://api.popcat.xyz/ship?user1=${encodeURIComponent(name1)}&user2=${encodeURIComponent(name2)}`;

    const imgPath = path.join(__dirname, "cache", `pair_${Date.now()}.png`);

    const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(response.data, "utf-8"));

    let msg = `💘 MATCHED!\n\n`;
    msg += `👤 ${name1}\n`;
    msg += `💞\n`;
    msg += `👤 ${name2}\n\n`;
    msg += `💖 Love: ${love}%\n`;

    if (love > 80) msg += "🔥 Perfect match!";
    else if (love > 50) msg += "💓 Cute pair!";
    else msg += "💔 Try again 😢";

    return api.sendMessage(
      {
        body: msg,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => fs.unlinkSync(imgPath)
    );
  }
};
