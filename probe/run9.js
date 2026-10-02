const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { Message } = require("discord.js");
require("dotenv").config();
process.on("unhandledRejection", (e) => console.error("[survived]", (e && (e.code || e.message || "")).toString().slice(0,90)));
const client = new ForgeClient({
    extensions: [new ForgeDB({ type: "better-sqlite3" })],
    intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
    prefixes: ["c!", "c?", "%"],
    events: ["messageCreate"]
});
client.functions.load("functions");
client.commands.load("probe");
client.commands.load("prefixesCmd");
(async () => {
    await client.login(process.env.BOT_TOKEN);
    await new Promise(r => setTimeout(r, 4000));
    const channel = await client.channels.fetch(process.env.TEST_CHANNEL);
    const send = async (content) => {
        const msg = new Message(client, {
            id: `${Date.now()}${Math.floor(Math.random()*99)}`,
            channel_id: process.env.TEST_CHANNEL, guild_id: process.env.TEST_GUILD, content,
            author: { id: process.env.TEST_AUTHOR, username: "hara", discriminator: "0", bot: false },
            member: { user: { id: process.env.TEST_AUTHOR }, roles: [], joined_at: new Date().toISOString() },
            timestamp: new Date().toISOString(), tts: false, mention_everyone: false, pinned: false, type: 0
        }, channel);
        client.emit("messageCreate", msg);
        await new Promise(r => setTimeout(r, 6000));
    };
    await send(process.env.PROBE_CMD || "%p8");
    process.exit(0);
})();
