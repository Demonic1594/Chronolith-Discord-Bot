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

async function poll() {
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1200));
        const res = await fetch(`https://discord.com/api/v10/channels/${process.env.TEST_CHANNEL}/messages?limit=5`, { headers: { Authorization: "Bot " + process.env.BOT_TOKEN } });
        const msgs = await res.json();
        for (const m of (msgs || [])) {
            const d = (m.embeds || [{}])[0]?.description || m.content;
            if (m.author.id === client.user.id && d && d.includes("direct-len")) {
                console.log("REPLY:", d.slice(0, 200));
                process.exit(0);
            }
        }
    }
    console.log("NO REPLY"); process.exit(1);
}
(async () => {
    await client.login(process.env.BOT_TOKEN);
    await new Promise(r => setTimeout(r, 4000));
    const channel = await client.channels.fetch(process.env.TEST_CHANNEL);
    const msg = new Message(client, {
        id: `${Date.now()}5${Math.floor(Math.random()*99)}`,
        channel_id: process.env.TEST_CHANNEL, guild_id: process.env.TEST_GUILD,
        content: "%p5",
        author: { id: process.env.TEST_AUTHOR, username: "x", discriminator: "0", bot: false },
        member: { user: { id: process.env.TEST_AUTHOR }, roles: [], joined_at: new Date().toISOString() },
        timestamp: new Date().toISOString(), tts: false, mention_everyone: false, pinned: false, type: 0
    }, channel);
    client.emit("messageCreate", msg);
    poll();
})();
