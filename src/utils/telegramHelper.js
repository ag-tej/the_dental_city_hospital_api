import axios from "axios";
import https from "https";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Create an HTTPS agent that forces IPv4 and enables keep-alive.
const httpsAgent = new https.Agent({
  keepAlive: true,
  family: 4,
});

async function sendTelegramMessage(message) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(
      url,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      },
      {
        timeout: 15000,
        httpsAgent,
      }
    );
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

export { sendTelegramMessage };
