const axios = require("axios");

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "3.0",
    author: "NC-SAIM (rev by GPT)",
    countDown: 10,
    role: 0,
    shortDescription: "🧠 English quiz game",
    category: "game",
    guide: {
      en: "{pn} — Start English quiz"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      // 🔥 English Quiz API (Open Trivia DB)
      const res = await axios.get(
        "https://opentdb.com/api.php?amount=1&type=multiple"
      );

      const q = res.data.results[0];

      const question = q.question;
      const correct = q.correct_answer;
      const incorrect = q.incorrect_answers;

      // Combine and shuffle answers
      let options = [...incorrect, correct];
      options = options.sort(() => Math.random() - 0.5);

      const letters = ["A", "B", "C", "D"];

      const formatted = {};
      letters.forEach((l, i) => {
        formatted[l] = options[i];
      });

      const correctLetter = Object.keys(formatted).find(
        key => formatted[key] === correct
      );

      const body = `🧠 𝗘𝗡𝗚𝗟𝗜𝗦𝗛 𝗤𝗨𝗜𝗭

❓ ${question}

A) ${formatted.A}
B) ${formatted.B}
C) ${formatted.C}
D) ${formatted.D}

💡 Reply with A / B / C / D`;

      api.sendMessage(body, event.threadID, (err, info) => {
        if (err) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          answer: correctLetter,
          options: formatted,
          chances: 3
        });
      });

    } catch (err) {
      console.error("QUIZ ERROR:", err);
      api.sendMessage("❌ Failed to load quiz.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    try {
      const { author, answer, options, chances } = Reply;

      if (event.senderID !== author) {
        return api.sendMessage("⚠️ This quiz is not yours!", event.threadID);
      }

      const userAns = (event.body || "").trim().toUpperCase();

      if (!["A", "B", "C", "D"].includes(userAns)) {
        return api.sendMessage("❌ Only A, B, C, D allowed!", event.threadID);
      }

      if (userAns === answer) {
        const rewardCoin = 300;
        const rewardExp = 100;

        const user = await usersData.get(event.senderID);
        user.money = (user.money || 0) + rewardCoin;
        user.exp = (user.exp || 0) + rewardExp;
        await usersData.set(event.senderID, user);

        global.GoatBot.onReply.delete(event.messageReply.messageID);

        return api.sendMessage(
          `✅ Correct Answer!\n🎉 +${rewardCoin} coins | +${rewardExp} EXP`,
          event.threadID
        );
      }

      Reply.chances--;

      if (Reply.chances > 0) {
        global.GoatBot.onReply.set(event.messageReply.messageID, Reply);

        return api.sendMessage(
          `❌ Wrong answer!\n🔁 Chances left: ${Reply.chances}`,
          event.threadID
        );
      }

      global.GoatBot.onReply.delete(event.messageReply.messageID);

      return api.sendMessage(
        `😢 Game Over!\n✅ Correct answer was: ${answer}`,
        event.threadID
      );

    } catch (err) {
      console.error(err);
    }
  }
};
