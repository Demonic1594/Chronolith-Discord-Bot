/* Visual identity v3 assertions: reply design, usage text, footers, palette. */
const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { Message } = require("discord.js");
require("dotenv").config();
const GUILD_ID = process.env.TEST_GUILD, CHANNEL_ID = process.env.TEST_CHANNEL, OWNER_ID = process.env.TEST_AUTHOR;
process.on("unhandledRejection", (e) => console.error("[survived]", (e?.code || e?.message || "").slice(0,100)));
const client = new ForgeClient({
    extensions: [new ForgeDB({ type: "better-sqlite3" })],
    intents: ["Guilds", "GuildMembers", "GuildModeration", "GuildMessages", "MessageContent"],
    prefixes: ["c!", "c?", "%"], events: ["messageCreate"]
});
client.functions.load("functions");
client.commands.load("events");
client.commands.load("prefixesCmd");
const results = [], waiters = [];
function expectReply(label, needles, timeoutMs = 9000) {
    return new Promise((resolve) => {
        const w = { label, needles, resolve, timer: setTimeout(() => {
            results.push({ label, ok: false, got: "(timeout)" });
            waiters.splice(waiters.indexOf(w), 1); resolve();
        }, timeoutMs) };
        waiters.push(w);
    });
}
client.on("messageCreate", (msg) => {
    if (msg.author.id !== client.user.id) return;
    const e = msg.embeds[0]?.data;
    const text = [e?.author?.name, e?.title, e?.description, msg.content,
                  JSON.stringify(e?.fields || []), e?.footer?.text,
                  (e?.color || 0).toString(16).toUpperCase().padStart(6, "0")].join("\n");
    for (const w of [...waiters]) {
        if (w.needles.every(n => text.includes(n))) {
            clearTimeout(w.timer);
            results.push({ label: w.label, ok: true, got: text.slice(0, 200) });
            waiters.splice(waiters.indexOf(w), 1); w.resolve();
        }
    }
});
async function send(content) {
    const channel = await client.channels.fetch(CHANNEL_ID);
    client.emit("messageCreate", new Message(client, {
        id: `${Date.now()}${Math.floor(Math.random()*999)}`, channel_id: CHANNEL_ID, guild_id: GUILD_ID, content,
        author: { id: OWNER_ID, username: "owner", discriminator: "0", bot: false },
        member: { user: { id: OWNER_ID }, roles: [], joined_at: new Date().toISOString() },
        timestamp: new Date().toISOString(), tts: false, mention_everyone: false, pinned: false, type: 0
    }, channel));
}
(async () => {
    await client.login(process.env.BOT_TOKEN);
    await new Promise(r => setTimeout(r, 4000));
    const BOT = client.user.id;
    const tests = [
        ["warn of bot = clean amber rejection", `%warn <@${BOT}> visual check round`,
         ["⛔ you cannot moderate me", "Chronolith • Moderation", "F0B232"]],
        ["claim usage shows [note] closed bracket", "%claim",
         ["[note]"]],
        ["close usage shows [note]", "%close", ["[note]"]],
        ["modlog recent view", "%modlog recent", ["Recent logs", "case(s) total"]],
        ["help footer page info", "%help", ["Chronolith • Page 1 of"]],
        ["config dashboard footer", "%config", ["Chronolith • Settings", "Modlog"]],
        ["ban reply: blockquote + danger color", `%ban <@${BOT}> danger visual` ,
         ["🔨 Banned", "> danger visual", "DA373C", "Chronolith • Moderation"]],
        ["mute duration usage shows [reason]", "%mute <@1553804378475864156>",
         ["A duration is required", "[reason]"]],
    ];
    for (const [label, content, needles] of tests) {
        const p = expectReply(label, needles);
        await send(content);
        await p;
    }
    console.log("\n===== VISUAL TEST RESULTS =====");
    let pass = 0;
    for (const r of results) {
        console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.label}${r.ok ? "" : " — got: " + r.got.slice(0,120)}`);
        if (r.ok) pass++;
    }
    console.log(`\n${pass}/${results.length} passed`);
    process.exit(pass === results.length ? 0 : 1);
})().catch(e => { console.error("harness error:", e?.message || e); process.exit(2); });
