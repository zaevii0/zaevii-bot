module.exports = {
  config: {
    name: "candycrush",
    aliases: ["cc"],
    version: "4.0",
    author: "NC-AZAD • upgraded by GPT",
    role: 0,
    countDown: 3,
    shortDescription: "🍬 Arcade Candy Crush",
    category: "game",
    guide: {
      en: "{pn} <bet>\n{pn} top\nReply: A1 U / D / L / R"
    }
  },

  onStart: async function ({ event, message, api, args, usersData }) {
    global.ccGame = global.ccGame || {};
    global.GoatBot = global.GoatBot || {};
    global.GoatBot.onReply = global.GoatBot.onReply || new Map();

    // ================= TOP =================
    if (args[0] === "top") {
      const all = (await usersData.getAll?.()) || [];

      const top = all
        .sort((a, b) => (b.ccScore || 0) - (a.ccScore || 0))
        .slice(0, 5);

      if (!top.length) return message.reply("⚡ No players yet!");

      let msg = "🏆 CANDY CRUSH ARCADE TOP 5 🏆\n\n";
      top.forEach((u, i) => {
        msg += `${i + 1}. UID ${u.userID} — 🎮 ${u.ccScore || 0}\n`;
      });

      return message.reply(msg);
    }

    // ================= BET =================
    const bet = parseInt(args[0]);
    if (!bet || bet <= 0)
      return message.reply("❌ Usage: .cc <bet>");

    const user = await usersData.get(event.senderID);
    if ((user.money || 0) < bet)
      return message.reply("❌ Not enough balance!");

    const board = generateBoard();

    global.ccGame[event.threadID] = {
      board,
      initiator: event.senderID,
      bet,
      combo: 0,
      total: 0,
      lastTime: Date.now(),
      messageID: null
    };

    const sent = await message.reply(
      displayBoard(board) +
      `\n💰 Bet: ${bet}\n🔥 Reply: A1 U / D / L / R`
    );

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "candycrush",
      author: event.senderID
    });

    global.ccGame[event.threadID].messageID = sent.messageID;
  },

  onReply: async function ({ event, message, api, usersData }) {
    const game = global.ccGame?.[event.threadID];
    if (!game) return;

    const r = global.GoatBot.onReply.get(event.messageReply.messageID);
    if (!r || r.author !== event.senderID) return;

    const [pos, dir] = (event.body || "").toUpperCase().split(" ");
    if (!/^[A-E][1-5]$/.test(pos)) return;

    let [r1, c1] = getPos(pos);
    let r2 = r1, c2 = c1;

    if (dir === "U") r2--;
    else if (dir === "D") r2++;
    else if (dir === "L") c2--;
    else if (dir === "R") c2++;
    else return;

    if (r2 < 0 || r2 > 4 || c2 < 0 || c2 > 4) return;

    swap(game.board, r1, c1, r2, c2);

    let reward = 0;
    let combo = 0;

    while (true) {
      const matches = findMatches(game.board);
      if (!matches.length) break;

      combo++;
      game.combo++;

      let base = matches.length * 60 * combo;

      // 💣 JACKPOT CHANCE (5%)
      if (Math.random() < 0.05) {
        base *= 5;
        message.reply("💣 JACKPOT CANDY ACTIVATED!");
      }

      // 🔥 BONUS MULTIPLIER
      if (combo >= 3) base *= 2;

      reward += base;

      removeMatches(game.board, matches);
      dropCandies(game.board);
    }

    if (!reward) return endGame(event.threadID, message, usersData);

    game.total += reward;

    const u = await usersData.get(event.senderID);
    u.money = (u.money || 0) + reward;
    u.ccScore = (u.ccScore || 0) + reward;
    await usersData.set(event.senderID, u);

    const sent = await message.reply(
      displayBoard(game.board) +
      `\n🔥 Combo x${combo}\n💰 +${reward}`
    );

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "candycrush",
      author: event.senderID
    });

    api.unsendMessage(game.messageID);
    game.messageID = sent.messageID;
  }
};

// ================= CORE =================

const ROWS = ["A","B","C","D","E"];
const CANDIES = ["🍫","🍬","🍪","🍩","🍉","🍭","🍒","🍓","💣","⭐"];

function generateBoard() {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () =>
      CANDIES[Math.floor(Math.random() * CANDIES.length)]
    )
  );
}

function displayBoard(b) {
  return "🍬 CANDY CRUSH ARCADE 🍬\n\n" +
    b.map((r, i) => `${ROWS[i]} | ${r.join(" ")}`).join("\n");
}

function getPos(p) {
  return [p.charCodeAt(0) - 65, Number(p[1]) - 1];
}

function swap(b, r1, c1, r2, c2) {
  [b[r1][c1], b[r2][c2]] = [b[r2][c2], b[r1][c1]];
}

function findMatches(b) {
  const m = [];

  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 3; c++)
      if (b[r][c] === b[r][c+1] && b[r][c] === b[r][c+2])
        m.push([r,c],[r,c+1],[r,c+2]);

  for (let c = 0; c < 5; c++)
    for (let r = 0; r < 3; r++)
      if (b[r][c] === b[r+1][c] && b[r][c] === b[r+2][c])
        m.push([r,c],[r+1,c],[r+2,c]);

  return m;
}

function removeMatches(b, m) {
  m.forEach(([r,c]) => b[r][c] = "⬜");
}

function dropCandies(b) {
  for (let c = 0; c < 5; c++)
    for (let r = 4; r >= 0; r--)
      if (b[r][c] === "⬜")
        b[r][c] = CANDIES[Math.floor(Math.random() * CANDIES.length)];
}

function endGame(threadID, message, usersData) {
  const g = global.ccGame?.[threadID];
  if (!g) return;

  const u = usersData.get(g.initiator);
  usersData.set(g.initiator, {
    money: Math.max(0, (u.money || 0) - g.bet)
  });

  message.reply(
    `🏁 GAME OVER\n🔥 Combos: ${g.combo}\n💰 Lost: ${g.bet}`
  );

  delete global.ccGame[threadID];
}
