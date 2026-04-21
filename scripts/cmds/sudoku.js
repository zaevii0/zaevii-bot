module.exports = {
  config: {
    name: "sudoku",
    aliases: ["sdk"],
    version: "1.0",
    author: "ChatGPT",
    role: 0,
    category: "game",
    shortDescription: {
      en: "Play Sudoku"
    },
    guide: {
      en:
        "{pn} start\n" +
        "{pn} fill <row> <col> <number>\n" +
        "{pn} show\n" +
        "{pn} reset"
    }
  },

  // 🧠 Store game per user
  games: new Map(),

  /* ========= UTIL ========= */

  generateBoard() {
    // simple fixed puzzle (can upgrade later)
    return [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ];
  },

  isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }

    const r = Math.floor(row / 3) * 3;
    const c = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (board[r + i][c + j] === num) return false;

    return true;
  },

  isComplete(board) {
    return board.every(row => row.every(cell => cell !== 0));
  },

  formatBoard(board) {
    return board.map((row, i) =>
      row.map(n => (n === 0 ? "⬜" : n)).join(" ")
    ).join("\n");
  },

  /* ========= START ========= */

  onStart: async function ({ args, event, message }) {
    const userID = event.senderID;

    if (!args[0] || args[0] === "start") {
      const board = this.generateBoard();

      this.games.set(userID, JSON.parse(JSON.stringify(board)));

      return message.reply(
        `🧩 SUDOKU STARTED\n\n` +
        this.formatBoard(board) +
        `\n\nUse:\n` +
        `sudoku fill <row> <col> <number>\n` +
        `Row/Col: 1-9`
      );
    }

    if (args[0] === "show") {
      const game = this.games.get(userID);
      if (!game) return message.reply("⚠️ Start a game first.");

      return message.reply("🧩 Current Board:\n\n" + this.formatBoard(game));
    }

    if (args[0] === "reset") {
      this.games.delete(userID);
      return message.reply("♻️ Game reset.");
    }

    /* ========= FILL ========= */

    if (args[0] === "fill") {
      const game = this.games.get(userID);
      if (!game) return message.reply("⚠️ Start a game first.");

      const row = parseInt(args[1]) - 1;
      const col = parseInt(args[2]) - 1;
      const num = parseInt(args[3]);

      if (
        isNaN(row) || isNaN(col) || isNaN(num) ||
        row < 0 || row > 8 ||
        col < 0 || col > 8 ||
        num < 1 || num > 9
      ) {
        return message.reply("❌ Invalid input. Use: fill row col number");
      }

      if (game[row][col] !== 0) {
        return message.reply("⚠️ Cell already filled.");
      }

      if (!this.isValid(game, row, col, num)) {
        return message.reply("❌ Invalid move!");
      }

      game[row][col] = num;

      if (this.isComplete(game)) {
        this.games.delete(userID);
        return message.reply(
          `🎉 YOU SOLVED THE SUDOKU!\n\n` +
          this.formatBoard(game)
        );
      }

      return message.reply(
        `✅ Move placed!\n\n` + this.formatBoard(game)
      );
    }
  }
};
