const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
process.on("unhandledRejection", () => {});
const c = new Client({ intents: [] });
(async () => {
    await c.login(process.env.BOT_TOKEN);
    const ch = await c.channels.fetch("1554103213949718628");
    await ch.send("%ping");
    setTimeout(() => process.exit(0), 15000);
})();
