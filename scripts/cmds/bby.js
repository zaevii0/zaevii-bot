const axios = require("axios");

const baseApiUrl = async () => {
  return "https://baby-apisx.vercel.app";
};

// Simple memory store (mood per user)
const babyMood = {};

const moods = ["happy", "sad", "sleepy", "clingy"];

const moodReplies = {
  happy: [
    "Hehe I'm so happy today! 🥰",
    "Yay! Baby is smiling 😊",
    "I feel warm and happy 💕"
  ],
  sad: [
    "I'm a little sad... 🥺",
    "Can you stay with baby? 😢",
    "Baby feels lonely..."
  ],
  sleepy: [
    "Zzz... baby is sleepy 🍼",
    "I want nap time 😴",
    "Hold me... I'm tired 🥺"
  ],
  clingy: [
    "Don't leave baby alone! 🥺",
    "Baby needs you always 💕",
    "Stay with me forever okay? 🤗"
  ]
};

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports.config = {
  name: "bby",
  aliases: ["baby"],
  version: "2.0.0",
  author: "NC-Aryan (Upgraded)",
  countDown: 0,
  role: 0,
  description: "Advanced baby roleplay AI",
  guide: {
    en: "{pn} <message>"
  }
};

module.exports.ncStart = async ({ api, event, args }) => {
  try {
    const uid = event.senderID;
    const text = args.join(" ").trim().toLowerCase();

    // assign mood if not exists
    if (!babyMood[uid]) {
      babyMood[uid] = random(moods);
    }

    // change mood randomly sometimes
    if (Math.random() < 0.2) {
      babyMood[uid] = random(moods);
    }

    // no message → baby speaks itself
    if (!text) {
      return api.sendMessage(
        random(moodReplies[babyMood[uid]]),
        event.threadID,
        event.messageID
      );
    }

    const apiBase = await baseApiUrl();
    const url = `${apiBase}/baby?text=${encodeURIComponent(text)}&senderID=${uid}`;

    const res = await axios.get(url);
    let reply = res.data?.reply;

    // fallback to baby personality if API fails
    if (!reply) {
      reply = random(moodReplies[babyMood[uid]]);
    }

    return api.sendMessage(reply, event.threadID, event.messageID);

  } catch (err) {
    console.error("Baby Error:", err);

    return api.sendMessage(
      "Baby is confused... 🥺 please try again",
      event.threadID,
      event.messageID
    );
  }
};

// Reply mode (chat behavior)
module.exports.ncReply = async ({ api, event }) => {
  try {
    const uid = event.senderID;

    if (!babyMood[uid]) babyMood[uid] = random(moods);

    const apiBase = await baseApiUrl();
    const url = `${apiBase}/baby?text=${encodeURIComponent(event.body)}&senderID=${uid}`;

    const res = await axios.get(url);

    return api.sendMessage(
      res.data?.reply || random(moodReplies[babyMood[uid]]),
      event.threadID,
      event.messageID
    );

  } catch (err) {
    return api.sendMessage(
      "Baby is sleeping right now... 🍼",
      event.threadID,
      event.messageID
    );
  }
};

// Prefix trigger (natural baby chat)
module.exports.ncPrefix = async ({ api, event }) => {
  try {
    const body = (event.body || "").toLowerCase();

    if (
      body.startsWith("baby ") ||
      body.startsWith("bby ") ||
      body.startsWith("hey baby")
    ) {
      const msg = body.replace(/^\S+\s*/, "").trim();

      if (!msg) {
        return api.sendMessage(
          "I'm here baby... 🥺",
          event.threadID,
          event.messageID
        );
      }

      const apiBase = await baseApiUrl();
      const url = `${apiBase}/baby?text=${encodeURIComponent(msg)}&senderID=${event.senderID}`;

      const res = await axios.get(url);

      return api.sendMessage(
        res.data?.reply || "🥺",
        event.threadID,
        event.messageID
      );
    }
  } catch (err) {
    console.error(err);
  }
};
