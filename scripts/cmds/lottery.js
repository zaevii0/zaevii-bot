module.exports = {
  config: {
    name: "lottery",
    aliases: ["lotto", "jackpotgame"],
    version: "2.0.0",
    author: "nc-xnil (upgraded)",
    role: 0,
    usePrefix: true,
    category: "economy",
    shortDescription: "Try your luck in the lottery",
    longDescription: "Buy a ticket and win random rewards",
    guide: "{pn}lottery",
    cooldowns: 10
  },

  ncStart: async function ({ event, message, usersData }) {
    const uid = event.senderID;

    const COST = 5000;
    const JACKPOT = 100000;

    const format = (n) =>
      n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" :
      n >= 1_000 ? (n / 1_000).toFixed(1) + "K" :
      n;

    const user = await usersData.get(uid);
    let money = user?.money || 0;

    if (money < COST) {
      return message.reply(
        `🎰 Lottery\n\n` +
        `❌ Not enough money\n` +
        `🎟 Ticket: ${format(COST)}\n` +
        `💰 Balance: ${format(money)}`
      );
    }

    // Deduct ticket cost first (prevents exploit)
    money -= COST;

    const roll = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * 10)
    );

    let reward = 0;
    let result = "No win";

    if (roll[0] === roll[1] && roll[1] === roll[2]) {
      reward = JACKPOT;
      result = "JACKPOT WIN";
    } else if (
      roll[0] === roll[1] ||
      roll[1] === roll[2] ||
      roll[0] === roll[2]
    ) {
      reward = 20000;
      result = "DOUBLE MATCH";
    } else if (roll.includes(7)) {
      reward = 10000;
      result = "LUCKY SEVEN";
    }

    money += reward;

    await usersData.set(uid, {
      ...user,
      money
    });

    return message.reply(
      `🎰 Lottery Result\n\n` +
      `Numbers: ${roll.join(" | ")}\n\n` +
      `Result: ${result}\n` +
      (reward ? `Reward: ${format(reward)}\n` : "") +
      `Cost: ${format(COST)}\n` +
      `Balance: ${format(money)}`
    );
  }
};
