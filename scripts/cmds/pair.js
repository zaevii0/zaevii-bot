module.exports = {
  config: {
    name: "pair",
    aliases: ["ship"],
    version: "4.0",
    author: "zaevii",
    category: "relationship"
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    const { threadID, senderID, participantIDs, mentions } = event;

    let target = Object.keys(mentions)[0];

    if (!target) {
      do {
        target = participantIDs[Math.floor(Math.random() * participantIDs.length)];
      } while (target === senderID);
    }

    const name1 = await usersData.getName(senderID);
    const name2 = await usersData.getName(target);

    const love = Math.floor(Math.random() * 101);

    await threadsData.set(threadID, {
      relationship: {
        couple: {
          user1: senderID,
          user2: target,
          love,
          level: 1,
          xp: 0,
          married: false
        }
      }
    });

    return api.sendMessage(
      `💘 NEW COUPLE CREATED\n\n👤 ${name1}\n💞 ${name2}\n\n💖 Love: ${love}%\n📈 Level: 1`,
      threadID
    );
  }
};
