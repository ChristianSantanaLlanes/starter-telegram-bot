import { Bot, webhookCallback, session, SessionFlavor, Context } from "grammy";
import express from "express";

//Performance and Limits
import { autoRetry } from "@grammyjs/auto-retry";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import { limit } from "@grammyjs/ratelimiter";

//Storage
import { freeStorage } from "@grammyjs/storage-free";

//Extra
import { hydrate, HydrateFlavor } from "@grammyjs/hydrate";
import { I18n, I18nFlavor } from "@grammyjs/i18n";

import { start } from "./commands/start";

interface SessionData {
  nombre: string;
}

export type MyContext = HydrateFlavor<Context> & SessionFlavor<SessionData> & I18nFlavor;
// Create a bot using the Telegram token
export const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN || "");

function initial(): SessionData {
  return { nombre: '' };
}

const i18n = new I18n<MyContext>({
  defaultLocale: "es", // ver más abajo para más información

  // Cargar todos los archivos de traducción de locales/.
  directory: "locales",
});

const throttler = apiThrottler();
bot.api.config.use(throttler);
bot.api.config.use(autoRetry());

bot.use(limit());
bot.use(i18n);
bot.use(session({ 
  initial, 
  storage: freeStorage<SessionData>(bot.token),
 }));
 bot.use(hydrate());

//Comandos
bot.command('start', async (ctx) => start(ctx));

// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
