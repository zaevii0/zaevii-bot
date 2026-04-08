module.exports = {
  config: {
    name: "breakup",
    version: "1.0",
    category: "relationship"
  },

  onStart: async function ({ api, event }) {
    if (!global.relationship?.[event.threadID])
      return api.sendMessage("💔 No relationship exists!", event.threadID);

    delete global.relationship[event.threadID];

    const drama = ["💔 Silent breakup...", "💔 Toxic ending...", "💔 Heart shattered..."];

    return api.sendMessage(
      drama[Math.floor(Math.random() * drama.length)],
      event.threadID
    );
  }
};
