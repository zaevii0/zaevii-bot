const fs = require("fs");
const path = require("path");

const { config } = global.noobCore;

module.exports = {
  config: {
    name: "diamond",
    aliases: ["dm", "dia"],
    version: "2.0.0",
    author: "T A N J I L 🎀 (upgraded)",
    role: 0,
    category: "game",
    description: "View, transfer, and manage diamonds",
    guide: {
      en: `
.dm → View your diamonds
.dm @tag → View user diamonds
.dm transfer @tag/reply/uid <amount>

Admin:
.dm add @tag/reply/uid <amount>
.dm delete @tag/reply/uid <amount>
      `
    }
  },

  ncStart: async function ({ message, usersData, event, args }) {
    const senderID = event.senderID;

    const adminIDs = Array.isArray(config.adminBot)
      ? config.adminBot
      : [config.adminBot];

    const isAdmin = adminIDs.includes(senderID);

    const filePath = path.join(__dirname, "..", "..", "data", "diamondData.json");

    let data = {};
    if (fs.existsSync(filePath)) {
      try {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch {
        data = {};
      }
    }

    const save = () => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const getUID = () => {
      if (event.messageReply) return event.messageReply.senderID;
      if (Object.keys(event.mentions || {}).length)
        return Object.keys(event.mentions)[0];
      if (args[1] && !isNaN(args[1]) && args[1].length > 10) return args[1];
      return null;
    };

    const getAmount = (index = 2) => {
      const val = args[index] || args[index - 1];
      return val && !isNaN(val) ? Number(val) : null;
    };

    const format = (n) => {
      const u = ["", "K", "M", "B", "T"];
      let i = 0;
      while (n >= 1000 && i < u.length - 1) {
        n /= 1000;
        i++;
      }
      return `${n.toFixed(2)}${u[i]}💎`;
    };

    const getName = async (uid) => {
      try {
        const u = await usersData.get(uid);
        return u?.name || "User";
      } catch {
        return "User";
      }
    };

    const uid = getUID();

    const getBalance = (id) => {
      id = String(id);
      if (data[id] == null) data[id] = 0;
      return Number(data[id]);
    };

    const setBalance = (id, value) => {
      data[String(id)] = Number(value);
      save();
    };

    /* ================= VIEW ================= */
    if (!args[0] || args[0] === "view") {
      const target = uid || senderID;
      const name = await getName(target);
      return message.reply(`💎 ${name}: ${format(getBalance(target))}`);
    }

    /* ================= ADD (ADMIN) ================= */
    if (args[0] === "add") {
      if (!isAdmin) return message.reply("Permission denied.");

      const amount = getAmount(2);
      if (!uid || !amount) return message.reply("Invalid format.");

      const newBal = getBalance(uid) + amount;
      setBalance(uid, newBal);

      const name = await getName(uid);
      return message.reply(`Added ${format(amount)} to ${name}. New: ${format(newBal)}`);
    }

    /* ================= DELETE (ADMIN) ================= */
    if (args[0] === "delete") {
      if (!isAdmin) return message.reply("Permission denied.");

      const amount = getAmount(2);
      if (!uid || !amount) return message.reply("Invalid format.");

      const current = getBalance(uid);
      if (current < amount) return message.reply("Not enough diamonds.");

      const newBal = current - amount;
      setBalance(uid, newBal);

      const name = await getName(uid);
      return message.reply(`Removed ${format(amount)} from ${name}. New: ${format(newBal)}`);
    }

    /* ================= TRANSFER ================= */
    if (args[0] === "transfer") {
      const amount = getAmount(2);
      if (!uid || !amount) return message.reply("Invalid format.");

      if (uid === senderID) return message.reply("You cannot transfer to yourself.");

      const senderBal = getBalance(senderID);
      if (senderBal < amount) return message.reply("Not enough diamonds.");

      setBalance(senderID, senderBal - amount);
      setBalance(uid, getBalance(uid) + amount);

      const name = await getName(uid);
      return message.reply(`Transferred ${format(amount)} to ${name}.`);
    }

    return message.reply(
      "Usage:\n.dm\n.dm @user\n.dm transfer @user amount\n(Admin)\n.dm add @user amount\n.dm delete @user amount"
    );
  }
};
