module.exports = {
  config: {
    name: "dice",
    aliases: ["dicegame", "rolldice", "dg", "dicebet"],
    version: "3.0",
    author: "NC-XNIL (rev by ChatGPT)",
    role: 0,
    category: "economy",
    shortDescription: {
      en: "Dice betting game"
    },
    guide: {
      en:
        "{pn} <bet> <amount>\n" +
        "{pn} <bet1> <bet2> <amount>\n\n" +
        "Example:\n{pn} low odd 300k"
    }
  },

  onStart: async function ({ args, usersData, event, message }) {
    const userID = event.senderID;
    const MAX_BET = 1_000_000;

    /* ===== UTIL ===== */

    const parseAmount = (input) => {
      const text = String(input).toLowerCase().trim();
      const match = text.match(/^(\d+(?:\.\d+)?)(k|m|b|t|qt)?$/);
      if (!match) return NaN;

      const num = Number(match[1]);
      const unit = match[2];

      const map = {
        k: 1e3,
        m: 1e6,
        b: 1e9,
        t: 1e12,
        qt: 1e15
      };

      return Math.floor(num * (map[unit] || 1));
    };

    const formatMoney = (n) => {
      if (n >= 1e15) return Math.floor(n / 1e15) + "qt";
      if (n >= 1e12) return Math.floor(n / 1e12) + "t";
      if (n >= 1e9) return Math.floor(n / 1e9) + "b";
      if (n >= 1e6) return Math.floor(n / 1e6) + "m";
      if (n >= 1e3) return Math.floor(n / 1e3) + "k";
      return String(n);
    };

    /* ===== INPUT ===== */

    if (args.length < 2) {
      return message.reply(
        `🎲 DICE GAME\n\n` +
        `Use:\n` +
        `dice <bet> <amount>\n` +
        `dice <bet1> <bet2> <amount>\n\n` +
        `Bets: high | low | even | odd | 7 | double`
      );
    }

    let bet1, bet2, rawAmount;

    if (args.length === 2) {
      bet1 = args[0].toLowerCase();
      rawAmount = args[1];
    } else {
      bet1 = args[0].toLowerCase();
      bet2 = args[1].toLowerCase();
      rawAmount = args[2];
    }

    const valid = ["high", "low", "even", "odd", "7", "double"];
    if (!valid.includes(bet1) || (bet2 && !valid.includes(bet2))) {
      return message.reply("❌ Invalid bet.");
    }

    const amount = parseAmount(rawAmount);
    if (!Number.isFinite(amount) || amount < 10) {
      return message.reply("⚠️ Minimum bet is 10.");
    }

    if (amount > MAX_BET) {
      return message.reply(`⚠️ Max bet is ${formatMoney(MAX_BET)}.`);
    }

    const balance = await usersData.getMoney(userID);
    if (balance < amount) {
      return message.reply(`💸 You only have ${formatMoney(balance)}.`);
    }

    /* ===== ROLL ===== */

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    const check = (b) => {
      switch (b) {
        case "high": return total >= 8;
        case "low": return total <= 6;
        case "even": return total % 2 === 0;
        case "odd": return total % 2 === 1;
        case "7": return total === 7;
        case "double": return dice1 === dice2;
        default: return false;
      }
    };

    const win = check(bet1) && (bet2 ? check(bet2) : true);

    /* ===== MULTIPLIER ===== */

    let multiplier = 0;

    if (win) {
      if (bet2) multiplier = 5;
      else if (bet1 === "7") multiplier = 5;
      else if (bet1 === "double") multiplier = 4;
      else multiplier = 2;
    }

    /* ===== MONEY ===== */

    let newBalance = balance;

    if (multiplier > 0) {
      const winAmount = amount * multiplier;
      newBalance += winAmount;
      await usersData.set(userID, { money: newBalance });

      return message.reply(
        `🎉 YOU WIN!\n\n` +
        `🎲 ${dice1} + ${dice2} = ${total}\n` +
        `🎯 Bet: ${[bet1, bet2].filter(Boolean).join(" + ")}\n\n` +
        `💰 +${formatMoney(winAmount)}\n` +
        `💳 Balance: ${formatMoney(newBalance)}`
      );
    } else {
      newBalance -= amount;
      await usersData.set(userID, { money: newBalance });

      return message.reply(
        `❌ YOU LOST\n\n` +
        `🎲 ${dice1} + ${dice2} = ${total}\n` +
        `🎯 Bet: ${[bet1, bet2].filter(Boolean).join(" + ")}\n\n` +
        `💸 -${formatMoney(amount)}\n` +
        `💳 Balance: ${formatMoney(newBalance)}`
      );
    }
  }
};
