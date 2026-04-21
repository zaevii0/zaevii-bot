const axios = require("axios");

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "2.0",
    author: "NC-SAIM (rev by ChatGPT)",
    countDown: 10,
    role: 0,
    category: "game",
    shortDescription: {
      en: "Answer quiz and earn rewards"
    },
    longDescription: {
      en: "Quiz game with rewards (coins + exp)"
    },
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event }) {
    try {
      // 🔗 Get API base
      const configURL = "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";
      const raw = await axios.get(configURL);
      const base = raw.data?.apiv1;

      if (!base)
        return message.reply("❌ Quiz API unavailable.");

      // 📜 Fetch quiz
      const res = await axios.get(`${base}/api/quiz`);
      const data = res.data;

      if (!data || !data.question)
        return message.reply("❌ Invalid quiz data.");

      const { question, options, answer } = data;

      const msg = await message.reply(
        `╭──❖ QUIZ GAME ❖──╮\n\n` +
        `📜 Question:\n${question}\n\n` +
        `🅐 ${options.a}\n` +
        `🅑 ${options.b}\n` +
        `🅒 ${options.c}\n` +
        `🅓 ${options.d}\n\n` +
        `💡 You have 3 chances\n` +
        `Reply: A / B / C / D\n` +
        `╰───────────────╯`
      );

      global.GoatBot.onReply.set(msg.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        correctAnswer: answer.trim(),
        options,
        chances: 3
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to fetch quiz!");
    }
  },

  onReply: async function ({ event, message, Reply, usersData }) {
    const { author, correctAnswer, options } = Reply;
    let { chances } = Reply;

    if (event.senderID !== author)
      return message.reply("⚠️ This is not your quiz!");

    const input = event.body?.trim().toUpperCase();

    if (!["A", "B", "C", "D"].includes(input))
      return message.reply("❌ Reply only A, B, C or D.");

    const selected =
      input === "A" ? options.a :
      input === "B" ? options.b :
      input === "C" ? options.c :
      input === "D" ? options.d : "";

    if (selected.trim() === correctAnswer.trim()) {
      global.GoatBot.onReply.delete(event.messageReply.messageID);

      const rewardCoin = 300;
      const rewardExp = 100;

      const user = await usersData.get(event.senderID);

      await usersData.set(event.senderID, {
        money: (user.money || 0) + rewardCoin,
        exp: (user.exp || 0) + rewardExp
      });

      return message.reply(
        `╭──✅ QUIZ RESULT ──╮\n` +
        `✔ Correct!\n` +
        `Answer: ${correctAnswer}\n\n` +
        `💰 +${rewardCoin} coins\n` +
        `✨ +${rewardExp} EXP\n` +
        `╰──────────────╯`
      );
    }

    // ❌ Wrong
    chances--;

    if (chances > 0) {
      global.GoatBot.onReply.set(event.messageReply.messageID, {
        ...Reply,
        chances
      });

      return message.reply(
        `❌ Wrong answer!\n🔁 Remaining chances: ${chances}`
      );
    }

    // 💀 Out of chances
    global.GoatBot.onReply.delete(event.messageReply.messageID);

    return message.reply(
      `😢 No chances left!\n` +
      `✅ Correct answer: ${correctAnswer}`
    );
  }
};
