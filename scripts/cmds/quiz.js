const axios = require("axios");

/* ===== SIMPLE ENGLISH CHECK ===== */
const isEnglish = (text = "") => {
  return /^[\x00-\x7F\s.,?!'"()-]+$/.test(text);
};

/* ===== CLEAN TEXT ===== */
const clean = (text = "") => {
  return text.replace(/[^a-zA-Z0-9\s.,?!'"()-]/g, "").trim();
};

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "2.2",
    author: "NC-SAIM (rev by zaevii)",
    role: 0,
    category: "game",
    shortDescription: {
      en: "English-only quiz game"
    },
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event }) {
    try {
      const configURL =
        "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";

      const raw = await axios.get(configURL);
      const base = raw.data?.apiv1;

      if (!base)
        return message.reply("Quiz service is unavailable.");

      const res = await axios.get(`${base}/api/quiz`);
      const data = res.data;

      if (!data || !data.question)
        return message.reply("Failed to load quiz.");

      let { question, options, answer } = data;

      /* ===== FORCE ENGLISH ONLY ===== */
      if (
        !isEnglish(question) ||
        !isEnglish(options.a) ||
        !isEnglish(options.b) ||
        !isEnglish(options.c) ||
        !isEnglish(options.d)
      ) {
        return message.reply("⚠️ Non-English quiz skipped. Try again.");
      }

      question = clean(question);
      options.a = clean(options.a);
      options.b = clean(options.b);
      options.c = clean(options.c);
      options.d = clean(options.d);

      const msg = await message.reply(
        `╭──❖ QUIZ GAME ❖──╮\n\n` +
        `📜 Question:\n${question}\n\n` +
        `A. ${options.a}\n` +
        `B. ${options.b}\n` +
        `C. ${options.c}\n` +
        `D. ${options.d}\n\n` +
        `💡 You have 3 attempts.\n` +
        `Reply A, B, C, or D\n` +
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
      return message.reply("Error fetching quiz question.");
    }
  },

  onReply: async function ({ event, message, Reply, usersData }) {
    const { author, correctAnswer, options } = Reply;
    let { chances } = Reply;

    if (event.senderID !== author)
      return message.reply("This quiz is not for you.");

    const input = event.body?.trim().toUpperCase();

    if (!["A", "B", "C", "D"].includes(input))
      return message.reply("Reply only A, B, C, or D.");

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
        `CORRECT ANSWER!\n\n` +
        `Answer: ${correctAnswer}\n\n` +
        `+${rewardCoin} coins\n` +
        `+${rewardExp} EXP`
      );
    }

    chances--;

    if (chances > 0) {
      global.GoatBot.onReply.set(event.messageReply.messageID, {
        ...Reply,
        chances
      });

      return message.reply(
        `Wrong answer!\nAttempts left: ${chances}`
      );
    }

    global.GoatBot.onReply.delete(event.messageReply.messageID);

    return message.reply(
      `No attempts left!\nCorrect answer: ${correctAnswer}`
    );
  }
};
