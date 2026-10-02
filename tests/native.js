/* Live probe of the native ban/kick/modlog rewrites (rejection paths only — no side effects). */
const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { Message } = require("discord.js");
require("dotenv").config();
process.on("unhandledRejection", (e) => console.error("[survived]", (e && (e.code || e.message || "")).toString().slice(0, 120)));
const GUILD_ID = process.env.TEST_GUILD, CHANNEL_ID = process.env.TEST_CHANNEL, ACTOR_ID = process.env.TEST_AUTHOR;
const BOT = "1553804378475864156";
const TOK = "Bot " + process.env.BOT_TOKEN;
const client = new ForgeClient({
    extensions: [new ForgeDB({ type: "better-sqlite3" })],
    intents: ["Guilds", "GuildMembers", "GuildModeration", "GuildMessages", "MessageContent"],
    prefixes: ["%"], events: ["messageCreate"]
});
client.functions.load("functions");
client.commands.load("prefixesCmd");
const dbsplit = require("../dbsplit");
const results = [];
async function restGet(path) {
    const res = await fetch("https://discord.com/api/v10" + path, { headers: { Authorization: TOK } });
    return res.json();
}
async function send(content) {
    const msg = new Message(client, {
        id: `${Date.now()}${Math.floor(Math.random() * 99)}`, channel_id: CHANNEL_ID, guild_id: GUILD_ID, content,
        author: { id: ACTOR_ID, username: "owner", discriminator: "0", bot: false },
        member: { user: { id: ACTOR_ID }, roles: [], joined_at: new Date().toISOString() },
        timestamp: new Date().toISOString(), tts: false, mention_everyone: false, pinned: false, type: 0
    }, await client.channels.fetch(CHANNEL_ID));
    client.emit("messageCreate", msg);
}
async function waitFor(label, needles, timeoutMs = 9000, sinceTs = Date.now()) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 1200));
        const msgs = await restGet(`/channels/${CHANNEL_ID}/messages?limit=8`);
        for (const m of (msgs || [])) {
            if (m.author?.id !== BOT) continue;
            if (new Date(m.timestamp).getTime() < sinceTs - 60000) continue;
            const e = (m.embeds || [{}])[0] || {};
            const text = [(e.author || {}).name, e.title, e.description, m.content, (e.footer || {}).text].join("\n");
            if (needles.every((n) => text.includes(n))) { results.push({ label, ok: true }); return; }
            for (const n of needles) if (!text.includes(n)) { results.push({ label, ok: false, got: text.slice(0, 160) }); break; }
            if (results[results.length - 1] && results[results.length - 1].label === label && !results[results.length - 1].ok) { results.pop(); }
        }
    }
    results.push({ label, ok: false, got: "(timeout)" });
}
(async () => {
    await client.login(process.env.BOT_TOKEN);
    await dbsplit.init();
    await new Promise((r) => setTimeout(r, 2000));
    const tests = [
        ["ban of bot = skipped + why", `%ban <@${BOT}> native round`, ["The Ban Hammer has spoken!", "0", "skipped", "cannot be moderated"]],
        ["kick of bot = skipped + why", `%kick <@${BOT}> native round`, ["The Booty Kick", "skipped", "cannot be moderated"]],
        ["hardban of bot = skipped", `%hardban <@${BOT}> 10m native round`, ["The Ban Hammer has spoken!", "skipped", "cannot be moderated"]],
        ["hardban missing duration = usage", `%hardban <@${BOT}>`, ["A duration is required", "[reason]"]],
        ["modlog recent still renders", "%modlog", ["Chronolith • Modlog", "Page 1 of"]],
        ["case card renders", "%case 1", ["Modlog • Case #1"]],
    ];
    for (const [label, content, needles] of tests) {
        const p = waitFor(label, needles);
        await send(content);
        await p;
        await new Promise((r) => setTimeout(r, 3200));
    }
    console.log("\n===== NATIVE REWRITE RESULTS =====");
    let pass = 0;
    for (const r of results) { console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.label}${r.ok ? "" : " — got: " + String(r.got).slice(0, 140)}`); if (r.ok) pass++; }
    console.log(`\n${pass}/${results.length} passed`);
    process.exit(pass === results.length ? 0 : 1);
})().catch((e) => { console.error("harness error:", e); process.exit(2); });
