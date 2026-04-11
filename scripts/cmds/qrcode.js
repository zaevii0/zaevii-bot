const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "qrcode",
    aliases: ["qr"],
    version: "2.1",
    author: "𝑵𝑪-𝑺𝑨𝑰𝑴",
    team: "NoobCore",
    countDown: 5,
    role: 0,
    shortDescription: "Make or scan QR code",
    longDescription: "Generate QR code from text or scan QR from image",
    category: "tools",
    guide: {
      en: "{pn} make <text>\n{pn} scan <reply image | image url>"
    }
  },

  ncStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    const action = args[0];

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    if (!action) {
      return api.sendMessage(
        "🌀 Usage:\n• qrcode make <text>\n• qrcode scan <image_url or reply image>",
        threadID,
        messageID
      );
    }

    try {
      const raw = await axios.get(
        "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json"
      );

      const apiBase = raw.data?.apiv1;
      if (!apiBase) {
        return api.sendMessage("❌ API base not found.", threadID, messageID);
      }

      // ================= MAKE QR =================
      if (action === "make") {
        const text = args.slice(1).join(" ");
        if (!text) {
          return api.sendMessage("❌ Please provide text to generate QR.", threadID, messageID);
        }

        const url = `${apiBase}/api/qrmake?text=${encodeURIComponent(text)}`;

        const res = await axios.get(url, { responseType: "arraybuffer" });

        const filePath = path.join(cacheDir, `qr_${Date.now()}.png`);
        await fs.writeFile(filePath, res.data);

        return api.sendMessage(
          {
            body: `✅ QR Generated\n📄 ${text}`,
            attachment: fs.createReadStream(filePath)
          },
          threadID,
          () => fs.unlinkSync(filePath),
          messageID
        );
      }

      // ================= SCAN QR =================
      if (action === "scan") {
        let imageUrl = args.slice(1).join(" ");

        if (
          messageReply?.attachments?.length &&
          messageReply.attachments[0].type === "photo"
        ) {
          imageUrl = messageReply.attachments[0].url;
        }

        if (!imageUrl) {
          return api.sendMessage(
            "📸 Please provide an image URL or reply to a QR image.",
            threadID,
            messageID
          );
        }

        const url = `${apiBase}/api/qrscan?url=${encodeURIComponent(imageUrl)}`;
        const res = await axios.get(url);

        if (res.data?.decoded) {
          return api.sendMessage(
            `🔍 QR Result:\n${res.data.decoded}`,
            threadID,
            messageID
          );
        } else {
          return api.sendMessage("⚠️ No valid QR code found.", threadID, messageID);
        }
      }

      // ================= INVALID =================
      return api.sendMessage(
        "❌ Invalid option.\n\n• qrcode make <text>\n• qrcode scan <image>",
        threadID,
        messageID
      );

    } catch (err) {
      console.error("QR ERROR:", err);
      return api.sendMessage(
        "❌ Failed to process QR code. Please try again later.",
        threadID,
        messageID
      );
    }
  }
};
