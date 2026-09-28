const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { Message } = require("discord.js");
require("dotenv").config();
process.on("unhandledRejection", (e) => console.error("[survived]", (e && (e.code || e.message || "")).toString().slice(0,100)));
const client = new ForgeClient({
    extensions: [new ForgeDB({ type: "better-sqlite3" })],
    intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
    prefixes: ["c!", "c?", "%"],
    events: ["messageCreate"]
});
client.functions.load("functions");
client.commands.load("probe");
client.on("messageCreate", (m) => {
    if (m.author.id === client.user.id) {
        const d = m.embeds[0]?.data?.description || m.content;
        if (d) { console.log("REPLY:", d.slice(0, 160)); process.exit(0); }
    }
});
(async () => {
    await client.login(process.env.BOT_TOKEN);
    await new Promise(r => setTimeout(r, 4000));
    const channel = await client.channels.fetch(process.env.TEST_CHANNEL);
    const msg = new Message(client, {
        id: `${Date.now()}5${Math.floor(Math.random()*99)}`,
        channel_id: process.env.TEST_CHANNEL, guild_id: process.env.TEST_GUILD,
        content: "%p1",
        author: { id: process.env.TEST_AUTHOR, username: "x", discriminator: "0", bot: false },
        member: { user: { id: process.env.TEST_AUTHOR }, roles: [], joined_at: new Date().toISOString() },
        timestamp: new Date().toISOString(), tts: false, mention_everyone: false, pinned: false, type: 0
    }, channel);
    client.emit("messageCreate", msg);
    setTimeout(() => { console.log("NO REPLY"); process.exit(1); }, 15000);
})();
