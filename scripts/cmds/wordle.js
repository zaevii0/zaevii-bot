const fs = require("fs");

// 📚 Word banks by difficulty
const WORDS = {
  easy: [
    "apple","grape","chair","plant","beach","candy","stone","light","smile","dream"
  ],
  medium: [
    "robot","flame","crane","storm","cloud","heart","river","world","night","bread"
  ],
  hard: [
    "zebra","angle","piano","sword","glory","laser","eagle","power","trace","brave"
  ]
};

module.exports = {
  config: {
    name: "wordle",
    aliases: ["wl"],
    version: "2.0",
    author: "z",
    role: 0,
    category: "game",
    shortDescription: {
      en: "Wordle game (PRO version)"
    },
    guide: {
      en:
        "{pn} start <easy|medium|hard>\n" +
        "{pn} guess <word>\n" +
        "{pn} giveup"
    }
  },

  games: new Map(),

  /* ===== PICK RANDOM WORD ===== */
  getWord(diff) {
    const pool = WORDS[diff] || WORDS.easy;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /* ===== WORDLE STYLE RESULT ===== */
  checkWord(guess, word) {
    let res = "";

    for (let i = 0; i < 5; i++) {
      if (guess[i] === word[i]) res += "🟩";
      else if (word.includes(guess[i])) res += "🟨";
      else res += "⬜";
    }

    return res;
  },

  /* ===== START ===== */
  onStart: async function ({ args, event, message }) {
    const userID = event.senderID;

    /* ===== START GAME ===== */
    if (!args[0] || args[0] === "start") {
      const diff = (args[1] || "easy").toLowerCase();

      const word = this.getWord(diff);

      this.games.set(userID, {
        word,
        diff,
        attempts: 6,
        history: []
      });

      return message.reply(
        `🧩 WORDLE PRO STARTED\n\n` +
        `🎯 Difficulty: ${diff.toUpperCase()}\n` +
        `🔤 Word length: 5 letters\n` +
        `🔁 Attempts: 6\n\n` +
        `Use:\nwordle guess <word>`
      );
    }

    const game = this.games.get(userID);
    if (!game)
      return message.reply("⚠️ Start a game first.");

    /* ===== GIVE UP ===== */
    if (args[0] === "giveup") {
      this.games.delete(userID);
      return message.reply(`😢 Word was: ${game.word.toUpperCase()}`);
    }

    /* ===== GUESS ===== */
    if (args[0] === "guess") {
      const guess = args[1]?.toLowerCase();

      if (!guess || guess.length !== 5) {
        return message.reply("❌ Enter a 5-letter word.");
      }

      game.attempts--;

      const result = this.checkWord(guess, game.word);
      game.history.push(`${guess.toUpperCase()} → ${result}`);

      /* ===== WIN ===== */
      if (guess === game.word) {
        this.games.delete(userID);

        return message.reply(
          `🎉 YOU WIN!\n\n` +
          `${guess.toUpperCase()}\n${result}\n\n` +
          `🏆 Correct word found!`
        );
      }

      /* ===== LOSE ===== */
      if (game.attempts <= 0) {
        this.games.delete(userID);

        return message.reply(
          `💀 GAME OVER!\n\n` +
          `Word: ${game.word.toUpperCase()}`
        );
      }

      return message.reply(
        `❌ Wrong guess!\n\n` +
        `${guess.toUpperCase()}\n${result}\n\n` +
        `🔁 Attempts left: ${game.attempts}\n\n` +
        `History:\n${game.history.join("\n")}`
      );
    }
  }
};
