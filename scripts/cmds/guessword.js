const words = [
  "apple","grape","tiger","chair","plant",
  "robot","beach","candy","stone","light"
];

module.exports = {
  config: {
    name: "guessword",
    aliases: ["gw"],
    version: "1.0",
    author: "ChatGPT",
    role: 0,
    category: "game",
    shortDescription: {
      en: "Guess the hidden word"
    },
    guide: {
      en:
        "{pn} start\n" +
        "{pn} guess <word>\n" +
        "{pn} hint\n{pn} giveup"
    }
  },

  games: new Map(),

  /* ===== FORMAT BOXES ===== */
  formatWord(word, revealed = []) {
    return word
      .split("")
      .map((c, i) => (revealed.includes(i) ? c.toUpperCase() : "⬜"))
      .join(" ");
  },

  /* ===== START ===== */
  onStart: async function ({ args, event, message }) {
    const userID = event.senderID;

    if (!args[0] || args[0] === "start") {
      const word = words[Math.floor(Math.random() * words.length)];

      this.games.set(userID, {
        word,
        revealed: [],
        attempts: 6
      });

      return message.reply(
        `🧩 GUESS THE WORD\n\n` +
        this.formatWord(word) +
        `\n\n💡 ${word.length}-letter word\n` +
        `🔁 Attempts: 6\n\n` +
        `Use: guessword guess <word>`
      );
    }

    const game = this.games.get(userID);
    if (!game)
      return message.reply("⚠️ Start a game first.");

    /* ===== HINT ===== */
    if (args[0] === "hint") {
      if (game.revealed.length >= game.word.length)
        return message.reply("⚠️ No more hints!");

      let i;
      do {
        i = Math.floor(Math.random() * game.word.length);
      } while (game.revealed.includes(i));

      game.revealed.push(i);

      return message.reply(
        `💡 Hint revealed!\n\n` +
        this.formatWord(game.word, game.revealed)
      );
    }

    /* ===== GIVE UP ===== */
    if (args[0] === "giveup") {
      this.games.delete(userID);
      return message.reply(`😢 The word was: ${game.word.toUpperCase()}`);
    }

    /* ===== GUESS ===== */
    if (args[0] === "guess") {
      const guess = args[1]?.toLowerCase();

      if (!guess || guess.length !== game.word.length) {
        return message.reply(
          `❌ Enter a ${game.word.length}-letter word.`
        );
      }

      game.attempts--;

      // 🎯 correct
      if (guess === game.word) {
        this.games.delete(userID);

        return message.reply(
          `🎉 CORRECT!\n\n` +
          `Word: ${game.word.toUpperCase()}\n` +
          `🏆 You solved it!`
        );
      }

      // 🔍 reveal correct letters (Wordle style)
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === game.word[i] && !game.revealed.includes(i)) {
          game.revealed.push(i);
        }
      }

      if (game.attempts <= 0) {
        this.games.delete(userID);
        return message.reply(
          `💀 GAME OVER!\n\n` +
          `Word was: ${game.word.toUpperCase()}`
        );
      }

      return message.reply(
        `❌ Wrong guess!\n\n` +
        this.formatWord(game.word, game.revealed) +
        `\n\n🔁 Attempts left: ${game.attempts}`
      );
    }
  }
};
