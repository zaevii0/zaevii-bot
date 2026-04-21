const guessOptions = ["🐣", "🙂", "🍀", "🌸", "🌼", "🐟", "🍎", "🍪", "🦄", "🎯"];

const LIMIT_INTERVAL_HOURS = 12;
const MAX_PLAYS = 20;

module.exports = {
  config: {
    name: "guess",
    version: "2.0",
    author: "XNil (rev by ChatGPT)",
    countDown: 5,
    role: 0,
    category: "game",
    shortDescription: {
      en: "Guess the emoji"
    },
    longDescription: {
      en: "Bet coins and guess the correct emoji"
    },
    guide: {
      en: "{pn} <amount>\n{pn} top"
    }
  },

  onStart: async function ({ args, event, message, usersData }) {
    const senderID = event.senderID;

    // 🏆 Leaderboard
    if (args[0] === "top") {
      const allUsers = await usersData.getAll();
      const top = allUsers
        .filter(u => u.data?.guessWin)
        .sort((a, b) => (b.data.guessWin || 0) - (a.data.guessWin || 0))
        .slice(0, 20);

      if (!top.length)
        return message.reply("🚫 No winners yet!");

      const msg = top.map((u, i) =>
        `${i + 1}. ${u.name} — 🏆 ${u.data.guessWin}`
      ).join("\n");

      return message.reply(`🏆 TOP GUESSERS 🏆\n\n${msg}`);
    }

    // 💰 Bet
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0)
      return message.reply("⚠️ Enter a valid bet amount.");

    const user = await usersData.get(senderID);
    if (user.money < bet)
      return message.reply("💸 Not enough coins.");

    // ⏱️ Limit system
    const now = Date.now();
    let playHistory = user.data?.guessPlayHistory || [];
    const lastReset = user.data?.guessLastReset || 0;

    if (now - lastReset > LIMIT_INTERVAL_HOURS * 3600000) {
      playHistory = [];
      await usersData.set(senderID, {
        "data.guessLastReset": now,
        "data.guessPlayHistory": []
      });
    }

    if (playHistory.length >= MAX_PLAYS)
      return message.reply(
        `⛔ Limit reached (${MAX_PLAYS}/${LIMIT_INTERVAL_HOURS}h).\nTry again later.`
      );

    // 🎲 Generate options (unique)
    const shuffled = [...guessOptions].sort(() => 0.5 - Math.random());
    const options = shuffled.slice(0, 3);

    const correctIndex = Math.floor(Math.random() * 3);

    const msg = await message.reply(
      `🎯 GUESS THE EMOJI\n\n` +
      `1️⃣ ${options[0]}   2️⃣ ${options[1]}   3️⃣ ${options[2]}\n\n` +
      `Reply 1 / 2 / 3 (30s)`
    );

    const timeout = setTimeout(() => {
      message.reply("⌛ Time's up!");
      global.GoatBot.onReply.delete(msg.messageID);
    }, 30000);

    global.GoatBot.onReply.set(msg.messageID, {
      commandName: this.config.name,
      author: senderID,
      correct: correctIndex + 1,
      emoji: options[correctIndex],
      bet,
      timeout
    });
  },

  onReply: async function ({ event, message, Reply, usersData }) {
    const senderID = event.senderID;

    if (senderID !== Reply.author)
      return message.reply("❌ Not your game.");

    const choice = event.body.trim();
    if (!["1", "2", "3"].includes(choice))
      return message.reply("⚠️ Reply only 1, 2, or 3.");

    clearTimeout(Reply.timeout);
    global.GoatBot.onReply.delete(Reply.messageID);

    const user = await usersData.get(senderID);
    let playHistory = user.data?.guessPlayHistory || [];

    // ➕ Add play
    playHistory.push(Date.now());

    let money = user.money;
    let result;

    if (parseInt(choice) === Reply.correct) {
      const win = Reply.bet * 4;
      money += win;

      const wins = (user.data?.guessWin || 0) + 1;

      await usersData.set(senderID, {
        money,
        "data.guessWin": wins,
        "data.guessPlayHistory": playHistory
      });

      result =
        `✅ Correct! ${Reply.emoji}\n` +
        `💰 +${win} coins\n💵 Balance: ${money}`;
    } else {
      money -= Reply.bet;

      await usersData.set(senderID, {
        money,
        "data.guessPlayHistory": playHistory
      });

      result =
        `❌ Wrong! (${Reply.correct}) ${Reply.emoji}\n` +
        `💸 -${Reply.bet} coins\n💵 Balance: ${money}`;
    }

    const remaining = MAX_PLAYS - playHistory.length;

    return message.reply(
      `${result}\n\n🎮 Plays: ${playHistory.length}/${MAX_PLAYS}\n` +
      (remaining > 0
        ? `🕹️ Remaining: ${remaining}`
        : `⛔ Limit reached`)
    );
  }
};
