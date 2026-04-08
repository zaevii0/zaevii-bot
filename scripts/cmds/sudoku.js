const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sudoku",
    aliases: ["sdk"],
    version: "3.0",
    author: "zaevii",
    countDown: 5,
    role: 0,
    shortDescription: "Sudoku with image grid",
    category: "game",
    guide: "{pn} [easy/medium/hard]"
  },

  onStart: async function ({ message, event, args }) {

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

    function drawGrid(grid) {
      const canvas = createCanvas(500, 550);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cellSize = 50;
      const offsetX = 50;
      const offsetY = 50;

      ctx.font = "20px Arial";
      ctx.fillStyle = "#000";

      // Column labels A-I
      const cols = "ABCDEFGHI";
      for (let i = 0; i < 9; i++) {
        ctx.fillText(cols[i], offsetX + i * cellSize + 18, 30);
      }

      // Row labels 1-9
      for (let i = 0; i < 9; i++) {
        ctx.fillText((i + 1), 20, offsetY + i * cellSize + 30);
      }

      // Grid lines
      for (let i = 0; i <= 9; i++) {
        ctx.lineWidth = (i % 3 === 0) ? 3 : 1;

        // horizontal
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + i * cellSize);
        ctx.lineTo(offsetX + 9 * cellSize, offsetY + i * cellSize);
        ctx.stroke();

        // vertical
        ctx.beginPath();
        ctx.moveTo(offsetX + i * cellSize, offsetY);
        ctx.lineTo(offsetX + i * cellSize, offsetY + 9 * cellSize);
        ctx.stroke();
      }

      // Numbers
      ctx.font = "22px Arial";
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] !== 0) {
            ctx.fillText(
              grid[r][c],
              offsetX + c * cellSize + 18,
              offsetY + r * cellSize + 30
            );
          }
        }
      }

      return canvas.toBuffer();
    }

    let solution = createSolved();
    let puzzle = clone(solution);
    removeCells(puzzle, removeCount);

    const imgBuffer = drawGrid(puzzle);
    const imgPath = path.join(__dirname, "cache", `sudoku_${Date.now()}.png`);
    fs.writeFileSync(imgPath, imgBuffer);

    return message.reply(
      {
        body: `🧩 SUDOKU (${difficulty.toUpperCase()})\n\nReply format: A1 5\nExample: B3 9`,
        attachment: fs.createReadStream(imgPath)
      },
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "sudoku",
          author: event.senderID,
          puzzle,
          solution
        });
      }
    );
  },

  onReply: async function ({ message, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    let { puzzle, solution } = Reply;
    const input = event.body.toUpperCase().split(" ");

    if (input.length !== 2)
      return message.reply("⚠️ Format: A1 5");

    let [pos, num] = input;
    num = parseInt(num);

    const cols = "ABCDEFGHI";
    let c = cols.indexOf(pos[0]);
    let r = parseInt(pos[1]) - 1;

    if (c < 0 || r < 0 || r > 8 || num < 1 || num > 9)
      return message.reply("❌ Invalid input");

    if (puzzle[r][c] !== 0)
      return message.reply("🚫 Already filled");

    if (solution[r][c] !== num)
      return message.reply("❌ Wrong");

    puzzle[r][c] = num;

    return this.onStart({
      message,
      event,
      args: []
    });
  }
};
