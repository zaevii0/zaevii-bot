const MAX_BET = 1_000_000;
const FREE_LIMIT = 20;
const PREMIUM_LIMIT = 30;

const LINE = "━━━━━━━━━━━━━━";

/* ===== MONEY FORMAT ===== */
const fm = (n = 0) => {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + "QT";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return String(n);
};

/* ===== PARSE BET ===== */
const parseBet = (input) => {
  if (!input) return NaN;
  const s = input.toLowerCase();

  if (s.endsWith("qt")) return Number(s.slice(0, -2)) * 1e15;
  if (s.endsWith("t")) return Number(s.slice(0, -1)) * 1e12;
  if (s.endsWith("b")) return Number(s.slice(0, -1)) * 1e9;
  if (s.endsWith("m")) return Number(s.slice(0, -1)) * 1e6;
  if (s.endsWith("k")) return Number(s.slice(0, -1)) * 1e3;

  return Number(s);
};

/* ===== DATE RESET ===== */
const getDate = () =>
  new Date().toLocaleDateString("en-CA");

const getBadge = (i) =>
  ["🥇","🥈","🥉"][i] || "🎖️";

module.exports = {
  config: {
    name: "mine",
    version: "3.0",
    author: "NC-xnil6x (rev by ChatGPT)",
    role: 0,
    category: "game",
    shortDescription: {
      en: "Mine betting game"
    },
    guide: {
      en:
        "{pn} <bet>\n" +
        "{pn} info\n" +
        "{pn} top"
    }
  },

  onStart: async function ({ args, event, message, usersData, api }) {
    const userID = event.senderID;
    const sub = (args[0] || "").toLowerCase();
    const today = getDate();

    const user = await usersData.get(userID);
    const isPremium = user.data?.premium?.status === true;
    const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;

    /* ===== RESET DAILY ===== */
    let todayStats = user.data?.mineToday || {};
    if (todayStats.date !== today) {
      todayStats = {
        date: today,
        play: 0,
        win: 0,
        half: 0,
        lose: 0
      };
    }

    let allStats = user.data?.mineAll || { win: 0 };

    /* ===== INFO ===== */
    if (sub === "info") {
      const winRate = todayStats.play
        ? ((todayStats.win / todayStats.play) * 100).toFixed(1)
        : "0.0";

      return message.reply(
`${LINE}
💣 MINE INFO
${LINE}
• Plays   : ${todayStats.play}/${limit}
• Wins    : ${todayStats.win}
• Half    : ${todayStats.half}
• Losses  : ${todayStats.lose}
• Rate    : ${winRate}%
${LINE}`
      );
    }

    /* ===== TOP ===== */
    if (sub === "top") {
      const all = await usersData.getAll();
      const top = all
        .map(u => ({
          name: u.name || "Unknown",
          win: u.data?.mineAll?.win || 0
        }))
        .sort((a, b) => b.win - a.win)
        .slice(0, 10);

      return message.reply(
`${LINE}
🏆 MINE TOP 10
${LINE}
${top.map((u, i) =>
`${getBadge(i)} ${u.name} — ${u.win} wins`
).join("\n")}
${LINE}`
      );
    }

    /* ===== BET ===== */
    const bet = parseBet(args[0]);

    if (!bet || isNaN(bet))
      return message.reply("❌ Invalid bet.");

    if (bet > MAX_BET)
      return message.reply(`🚫 Max bet: ${fm(MAX_BET)}`);

    if (todayStats.play >= limit)
      return message.reply(`⛔ Daily limit reached (${limit})`);

    if (user.money < bet)
      return message.reply("💸 Not enough money.");

    /* ===== GAME ===== */
    const roll = Math.random() * 100;
    let moneyCount = roll < 7 ? 5 : roll < 42 ? 3 : roll < 72 ? 2 : 0;

    const tiles = [1,2,3,4,5].sort(() => Math.random() - 0.5);
    const moneyTiles = tiles.slice(0, moneyCount);

    const result = [1,2,3,4,5].map(i =>
      moneyTiles.includes(i) ? "💰" : "💥"
    );

    let display = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣"];

    const msg = await message.reply(
`${LINE}
💣 MINE GAME
${LINE}
Bet: ${fm(bet)}

${display.join(" ")}
${LINE}`
    );

    /* ===== ANIMATION ===== */
    for (let i = 0; i < display.length; i++) {
      setTimeout(async () => {
        display[i] = result[i];

        await api.editMessage(display.join(" "), msg.messageID);

        if (i === 4) {
          todayStats.play++;

          let payout = 0;
          let title = "💀 YOU LOSE";

          if (moneyCount === 5) {
            payout = bet * 20;
            title = "🔥 JACKPOT";
            todayStats.win++;
            allStats.win++;
          } else if (moneyCount === 3) {
            payout = bet * 3;
            title = "🎉 YOU WIN";
            todayStats.win++;
            allStats.win++;
          } else if (moneyCount === 2) {
            payout = Math.floor(bet * 0.5);
            title = "⚠️ HALF RETURN";
            todayStats.half++;
          } else {
            todayStats.lose++;
          }

          const newMoney = user.money - bet + payout;

          await usersData.set(userID, {
            money: newMoney,
            "data.mineToday": todayStats,
            "data.mineAll": allStats
          });

          return api.editMessage(
`${LINE}
${title}
${LINE}
💰 ${payout ? "+" + fm(payout) : "-" + fm(bet)}
💳 Balance: ${fm(newMoney)}
🎮 Plays: ${todayStats.play}/${limit}
${LINE}`,
            msg.messageID
          );
        }
      }, (i + 1) * 700);
    }
  }
};
