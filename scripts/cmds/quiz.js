const axios = require("axios");

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "2.0",
    author: "NC-SAIM (rev by GPT)",
    countDown: 10,
    role: 0,
    shortDescription: "🧠 Quiz game",
    longDescription: "Answer quiz questions and earn rewards",
    category: "game",
    guide: {
      en: "{pn} — Start quiz"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const apiJson =
        "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";

      const raw = await axios.get(apiJson, { timeout: 10000 });
      const base = raw.data?.apiv1;

      if (!base) {
        return api.sendMessage("❌ API base not found.", event.threadID, event.messageID);
      }

      const { data } = await axios.get(`${base}/api/quiz`);

      if (!data?.question || !data?.options || !data?.answer) {
        return api.sendMessage("❌ Invalid quiz data.", event.threadID, event.messageID);
      }

      const body = `╭──❖  𝐐𝐔𝐈𝐙 𝐆𝐀𝐌𝐄  ❖──╮

📜 Question:
${data.question}

🅐 ${data.options.a}
🅑 ${data.options.b}
🅒 ${data.options.c}
🅓 ${data.options.d}

────────────────
💡 Reply with A / B / C / D
⏳ You have 3 chances
╰────────────────╯`;

      api.sendMessage(body, event.threadID, (err, info) => {
        if (err) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          answer: data.answer.trim(),
          options: data.options,
          chances: 3
        });
      });

    } catch (err) {
      console.error("QUIZ ERROR:", err);
      api.sendMessage("❌ Failed to load quiz.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    try {
      const { author, answer, options, chances } = Reply;

      if (event.senderID !== author) {
        return api.sendMessage("⚠️ This quiz is not for you!", event.threadID);
      }

      const userAnswer = (event.body || "").trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(userAnswer)) {
        return api.sendMessage("❌ Only A, B, C, D allowed!", event.threadID);
      }

      const selected =
        userAnswer === "A" ? options.a :
        userAnswer === "B" ? options.b :
        userAnswer === "C" ? options.c :
        options.d;

      if (selected.trim() === answer.trim()) {
        try {
          await api.unsendMessage(event.messageReply.messageID);
        } catch {}

        const rewardCoin = 300;
        const rewardExp = 100;

        const userData = await usersData.get(event.senderID);
        userData.money = (userData.money || 0) + rewardCoin;
        userData.exp = (userData.exp || 0) + rewardExp;
        await usersData.set(event.senderID, userData);

        global.GoatBot.onReply.delete(event.messageReply.messageID);

        return api.sendMessage(
          `✅ Correct Answer!\n🎉 +${rewardCoin} coins | +${rewardExp} EXP`,
          event.threadID
        );
      }

      // Wrong answer
      Reply.chances--;

      if (Reply.chances > 0) {
        global.GoatBot.onReply.set(event.messageReply.messageID, Reply);

        return api.sendMessage(
          `❌ Wrong answer!\n🔁 Chances left: ${Reply.chances}`,
          event.threadID
        );
      }

      try {
        await api.unsendMessage(event.messageReply.messageID);
      } catch {}

      global.GoatBot.onReply.delete(event.messageReply.messageID);

      return api.sendMessage(
        `😢 Game over!\n✅ Correct answer: ${answer}`,
        event.threadID
      );

    } catch (err) {
      console.error("QUIZ REPLY ERROR:", err);
    }
  }
};
