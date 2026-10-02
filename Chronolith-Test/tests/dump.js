const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { Message } = require("discord.js");
require("dotenv").config();
const G = process.env.TEST_GUILD, C = process.env.TEST_CHANNEL, A = process.env.TEST_AUTHOR;
process.on("unhandledRejection", () => {});
const client = new ForgeClient({
    extensions: [new ForgeDB({ type: "better-sqlite3" })],
    intents: ["Guilds", "GuildMembers", "GuildModeration", "GuildMessages", "MessageContent"],
    prefixes: ["c!", "c?", "%"], events: ["messageCreate"]
});
client.functions.load("functions");
client.commands.load("events");
client.commands.load("prefixesCmd");
client.commands.load("probe");
client.on("messageCreate", m => {
    if (m.author.id !== client.user.id) return;
    const e = m.embeds[0]?.data;
    console.log("=== REPLY ===");
    console.log("content:", JSON.stringify((m.content || "").slice(0, 300)));
    console.log("author:", e?.author?.name);
    console.log("desc:", (e?.description || "").slice(0, 150).replace(/\n/g, "\\n"));
    console.log("fields:", (e?.fields || []).map(f => `${f.name}=${(f.value||"").slice(0,40)}`).join(" | "));
    console.log("footer:", e?.footer?.text, "| color:", (e?.color||0).toString(16).toUpperCase().padStart(6,"0"), "| embed:", !!e);
});
(async () => {
    await client.login(process.env.BOT_TOKEN);
    await new Promise(r => setTimeout(r, 4000));
    const channel = await client.channels.fetch(C);
    for (const cmd of process.argv.slice(2)) {
        console.log("\n>>> " + cmd);
        client.emit("messageCreate", new Message(client, {
            id: `${Date.now()}${Math.floor(Math.random()*999)}`, channel_id: C, guild_id: G, content: cmd,
            author: { id: A, username: "owner", discriminator: "0", bot: false },
            member: { user: { id: A }, roles: [], joined_at: new Date().toISOString() },
            timestamp: new Date().toISOString(), tts: false, mention_everyone: false, pinned: false, type: 0
        }, channel));
        await new Promise(r => setTimeout(r, 7000));
    }
    process.exit(0);
})();
