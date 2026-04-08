module.exports = {
  config: {
    name: "sudoku",
    aliases: ["sdk", "puzzle"],
    version: "2.0",
    author: "zaevii",
    countDown: 5,
    role: 0,
    shortDescription: "Pro Sudoku game",
    longDescription: "Sudoku with levels, hints, rewards",
    category: "game",
    guide: "{pn} [easy/medium/hard]"
  },

  onStart: async function ({ message, event, args, usersData }) {

    const difficulty = (args[0] || "easy").toLowerCase();
    const removeCount = difficulty === "hard" ? 55 : difficulty === "medium" ? 45 : 35;

    function shuffle(arr) {
      return arr.sort(() => Math.random() - 0.5);
    }

    function createSolved() {
      let base = [1,2,3,4,5,6,7,8,9];
      let grid = [];

      for (let i = 0; i < 9; i++) {
        grid.push([...base.slice(i), ...base.slice(0, i)]);
        if (i % 3 === 2) base = shuffle(base);
      }
      return grid;
    }

    function clone(grid) {
      return grid.map(r => [...r]);
    }

    function removeCells(grid, count) {
      let removed = 0;
      while (removed < count) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (grid[r][c] !== 0) {
          grid[r][c] = 0;
          removed++;
        }
      }
    }

    function display(grid) {
      let text = "";
      for (let i = 0; i < 9; i++) {
        text += grid[i].map(n => n || "⬜").join(" ") + "\n";
        if ((i+1) % 3 === 0) text += "\n";
      }
      return text;
    }

    let solution = createSolved();
    let puzzle = clone(solution);
    removeCells(puzzle, removeCount);

    return message.reply(
      `🧩 SUDOKU (${difficulty.toUpperCase()})\n\n${display(puzzle)}\n` +
      `Reply:\n` +
      `• row col number\n` +
      `• "hint"\n`,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "sudoku",
          author: event.senderID,
          puzzle,
          solution,
          startTime: Date.now(),
          difficulty
        });
      }
    );
  },

  onReply: async function ({ message, event, Reply, usersData }) {
    if (event.senderID !== Reply.author) return;

    let { puzzle, solution, startTime, difficulty } = Reply;
    const input = event.body.toLowerCase();

    function display(grid) {
      let text = "";
      for (let i = 0; i < 9; i++) {
        text += grid[i].map(n => n || "⬜").join(" ") + "\n";
        if ((i+1) % 3 === 0) text += "\n";
      }
      return text;
    }

    // HINT
    if (input === "hint") {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (puzzle[i][j] === 0) {
            puzzle[i][j] = solution[i][j];
            return message.reply(`💡 Hint used!\n\n${display(puzzle)}`, (err, info) => {
              global.GoatBot.onReply.set(info.messageID, {
                ...Reply,
                puzzle
              });
            });
          }
        }
      }
    }

    const parts = input.split(" ").map(Number);
    if (parts.length !== 3)
      return message.reply("⚠️ Format: row col number");

    let [r, c, n] = parts;
    r--; c--;

    if (puzzle[r][c] !== 0)
      return message.reply("🚫 Cell already filled!");

    if (solution[r][c] !== n)
      return message.reply("❌ Wrong!");

    puzzle[r][c] = n;

    const finished = puzzle.every((row, i) =>
      row.every((val, j) => val === solution[i][j])
    );

    if (finished) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const reward = difficulty === "hard" ? 500 : difficulty === "medium" ? 300 : 150;

      const userData = await usersData.get(event.senderID);
      let balance = userData.money || 0;

      await usersData.set(event.senderID, {
        money: balance + reward
      });

      return message.reply(
        `🎉 COMPLETED!\n\n${display(puzzle)}\n⏱️ Time: ${timeTaken}s\n💰 Reward: +${reward}`
      );
    }

    return message.reply(
      `✅ Correct!\n\n${display(puzzle)}`,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          ...Reply,
          puzzle
        });
      }
    );
  }
};
