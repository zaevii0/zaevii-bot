module.exports = {
  config: {
    name: "pair",
    aliases: ["ship", "match"],
    version: "1.0",
    category: "relationship"
  },

  onStart: async function ({ api, event, usersData }) {
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

    global.relationship = global.relationship || {};
    global.relationship[threadID] = {
      user1: senderID,
      user2: target,
      love,
      level: 1,
      xp: 0,
      married: false
    };

    return api.sendMessage(
      `💘 PAIR CREATED\n\n👤 ${name1}\n💞 ${name2}\n💖 Love: ${love}%`,
      threadID
    );
  }
};
