module.exports = {
  config: {
    name: "blackjack",
    aliases: ["bj", "21"],
    version: "2.0",
    author: "zaevii",
    countDown: 5,
    role: 0,
    shortDescription: "Play Blackjack with betting",
    longDescription: "Advanced Blackjack with money system",
    category: "game",
    guide: "{pn} <bet>"
  },

  onStart: async function ({ message, args, usersData, event }) {
    const bet = parseInt(args[0]);

    if (!bet || bet <= 0)
      return message.reply("⚠️ Enter a valid bet amount");

    const userData = await usersData.get(event.senderID);
    const balance = userData.money || 0;

    if (bet > balance)
      return message.reply(`💸 Not enough money! Your balance: ${balance}`);

    const suits = ["♠️", "♥️", "♦️", "♣️"];
    const cards = [
      { name: "A", value: 11 },
      { name: "2", value: 2 },
      { name: "3", value: 3 },
      { name: "4", value: 4 },
      { name: "5", value: 5 },
      { name: "6", value: 6 },
      { name: "7", value: 7 },
      { name: "8", value: 8 },
      { name: "9", value: 9 },
      { name: "10", value: 10 },
      { name: "J", value: 10 },
      { name: "Q", value: 10 },
      { name: "K", value: 10 }
    ];

    function drawCard() {
      const card = cards[Math.floor(Math.random() * cards.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      return { ...card, suit };
    }

    function total(hand) {
      let sum = hand.reduce((a, c) => a + c.value, 0);
      let aces = hand.filter(c => c.name === "A").length;

      while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
      }
      return sum;
    }

    let player = [drawCard(), drawCard()];
    let dealer = [drawCard(), drawCard()];

    let playerTotal = total(player);

    const formatHand = (hand) =>
      hand.map(c => `${c.name}${c.suit}`).join(" ");

    let text = `🃏 BLACKJACK\n\n`;
    text += `💰 Bet: ${bet}\n\n`;
    text += `👤 You: ${formatHand(player)} (${playerTotal})\n`;
    text += `🤖 Dealer: ${dealer[0].name}${dealer[0].suit} ❓\n\n`;

    if (playerTotal === 21) {
      await usersData.set(event.senderID, {
        money: balance + bet * 2
      });
      return message.reply(`🎉 BLACKJACK! You win ${bet * 2}`);
    }

    text += `Reply: "hit" or "stand"`;

    return message.reply(text, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "blackjack",
        author: event.senderID,
        player,
        dealer,
        bet
      });
    });
  },

  onReply: async function ({ message, event, Reply, usersData }) {
    if (event.senderID != Reply.author) return;

    const suits = ["♠️", "♥️", "♦️", "♣️"];
    const cards = [
      { name: "A", value: 11 },
      { name: "2", value: 2 },
      { name: "3", value: 3 },
      { name: "4", value: 4 },
      { name: "5", value: 5 },
      { name: "6", value: 6 },
      { name: "7", value: 7 },
      { name: "8", value: 8 },
      { name: "9", value: 9 },
      { name: "10", value: 10 },
      { name: "J", value: 10 },
      { name: "Q", value: 10 },
      { name: "K", value: 10 }
    ];

    function drawCard() {
      const card = cards[Math.floor(Math.random() * cards.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      return { ...card, suit };
    }

    function total(hand) {
      let sum = hand.reduce((a, c) => a + c.value, 0);
      let aces = hand.filter(c => c.name === "A").length;

      while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
      }
      return sum;
    }

    const formatHand = (hand) =>
      hand.map(c => `${c.name}${c.suit}`).join(" ");

    let { player, dealer, bet } = Reply;
    let choice = event.body.toLowerCase();

    const userData = await usersData.get(event.senderID);
    let balance = userData.money || 0;

    if (choice === "hit") {
      player.push(drawCard());
      let playerTotal = total(player);

      if (playerTotal > 21) {
        await usersData.set(event.senderID, {
          money: balance - bet
        });

        return message.reply(
          `💥 BUSTED!\n${formatHand(player)} (${playerTotal})\nLost: ${bet}`
        );
      }

      return message.reply(
        `👤 ${formatHand(player)} (${playerTotal})\nReply "hit" or "stand"`,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "blackjack",
            author: event.senderID,
            player,
            dealer,
            bet
          });
        }
      );
    }

    if (choice === "stand") {
      while (total(dealer) < 17) {
        dealer.push(drawCard());
      }

      let playerTotal = total(player);
      let dealerTotal = total(dealer);

      let result = `🃏 RESULT\n\n`;
      result += `👤 You: ${formatHand(player)} (${playerTotal})\n`;
      result += `🤖 Dealer: ${formatHand(dealer)} (${dealerTotal})\n\n`;

      if (dealerTotal > 21 || playerTotal > dealerTotal) {
        await usersData.set(event.senderID, {
          money: balance + bet
        });
        result += `🎉 You win +${bet}`;
      } else if (playerTotal < dealerTotal) {
        await usersData.set(event.senderID, {
          money: balance - bet
        });
        result += `😢 You lose -${bet}`;
      } else {
        result += `🤝 Tie (no loss)`;
      }

      return message.reply(result);
    }
  }
};
